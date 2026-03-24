import Reservation from "../models/Reservation.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import { sendReservationConfirmationInternal, sendBookingConfirmationInternal } from "./notificationController.js";

// Haversine formula to calculate distance between two lat/lng points in km
const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const calculateETA = async (req, res) => {
    try {
        const { originLat, originLng, destLat, destLng } = req.query;

        if (!originLat || !originLng || !destLat || !destLng) {
            return res.json({
                etaMins: 15,
                bufferMins: 5,
                totalReservationMins: 20
            });
        }

        const oLat = parseFloat(originLat);
        const oLng = parseFloat(originLng);
        const dLat = parseFloat(destLat);
        const dLng = parseFloat(destLng);

        let etaMins = null;

        // Try OSRM first for accurate road-based routing
        try {
            const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${oLng},${oLat};${dLng},${dLat}?overview=false`;
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout

            const osrmRes = await fetch(osrmUrl, { signal: controller.signal });
            clearTimeout(timeout);
            const data = await osrmRes.json();

            if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                etaMins = Math.ceil(data.routes[0].duration / 60);
                console.log(`📍 OSRM ETA: ${etaMins} mins (distance: ${(data.routes[0].distance / 1000).toFixed(1)} km)`);
            }
        } catch (osrmErr) {
            console.log("⚠️ OSRM unavailable, using Haversine fallback");
        }

        // Fallback: Haversine distance-based calculation
        if (!etaMins || etaMins <= 0) {
            const straightLineKm = haversineDistance(oLat, oLng, dLat, dLng);
            // Apply 1.4x road winding factor (roads are longer than straight-line)
            const roadDistanceKm = straightLineKm * 1.4;
            // Average city driving speed: 25 km/h
            const avgSpeedKmh = 25;
            etaMins = Math.max(1, Math.ceil((roadDistanceKm / avgSpeedKmh) * 60));
            console.log(`📍 Haversine ETA: ${etaMins} mins (straight: ${straightLineKm.toFixed(1)} km, road: ${roadDistanceKm.toFixed(1)} km)`);
        }

        // Dynamic buffer: shorter trips get smaller buffer
        const bufferMins = etaMins <= 5 ? 3 : etaMins <= 15 ? 5 : 8;

        res.json({
            etaMins,
            bufferMins,
            totalReservationMins: etaMins + bufferMins
        });
    } catch (error) {
        console.error("ETA Calculation Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const createReservation = async (req, res) => {
    try {
        const { userId, userEmail, parkingAreaId, slotId, vehicleType, etaMins, bufferMins, autoPenalty } = req.body;

        const bookingTime = new Date();
        const expiryTime = new Date(bookingTime.getTime() + (etaMins + bufferMins) * 60000);

        const newReservation = new Reservation({
            userId,
            userEmail,
            parkingAreaId,
            slotId,
            vehicleType,
            bookingTime,
            ETA: etaMins,
            bufferTime: bufferMins,
            reservationExpiryTime: expiryTime,
            reservationStatus: "reserved",
            autoPenalty: autoPenalty !== undefined ? autoPenalty : true
        });

        const savedReservation = await newReservation.save();
        console.log("🎟️ Reservation Created:", savedReservation._id);

        // Send Confirmation Email
        if (userEmail) {
            setImmediate(() => {
                sendReservationConfirmationInternal(userEmail, "Selected Parking Area", slotId, vehicleType, expiryTime)
                    .catch(err => console.error("📧 Reservation Email Error:", err));
            });
        }

        res.status(201).json({ message: "Reservation successful", reservation: savedReservation });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const checkInArrival = async (req, res) => {
    try {
        const { reservationId, expectedExit, paidAmount, userEmail, areaName } = req.body;

        const reservation = await Reservation.findById(reservationId);
        if (!reservation) return res.status(404).json({ message: "Reservation not found" });

        if (reservation.reservationStatus !== "reserved") {
            return res.status(400).json({ message: "Reservation is no longer active." });
        }

        // Mark Reservation as Occupied
        reservation.reservationStatus = "occupied";
        reservation.arrivalStatus = true;
        reservation.parkingStartTime = new Date();
        reservation.isBlockingSlot = false; // It's a real booking now, the slot is naturally blocked
        await reservation.save();

        // Create the actual Booking
        const newBooking = new Booking({
            userId: reservation.userId,
            slotId: reservation.slotId,
            areaId: reservation.parkingAreaId,
            areaName: areaName || "Unknown Area",
            vehicleType: reservation.vehicleType,
            entryTime: reservation.parkingStartTime,
            expectedExit: expectedExit || new Date(Date.now() + 60 * 60 * 1000), // Default 1 hour
            paidAmount: paidAmount || 0,
            userEmail: userEmail,
            status: "active"
        });

        const savedBooking = await newBooking.save();

        // Send Booking Confirmation Email
        if (userEmail) {
            setImmediate(() => {
                sendBookingConfirmationInternal(userEmail, areaName, reservation.slotId, reservation.vehicleType, reservation.parkingStartTime, expectedExit)
                    .catch(err => console.error("📧 Check-In Email Error:", err));
            });
        }

        res.json({ message: "Check-In successful", booking: savedBooking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getReservationsByArea = async (req, res) => {
    try {
        const { areaId } = req.params;
        const reservations = await Reservation.find({
            parkingAreaId: areaId,
            reservationStatus: "reserved"
        });

        res.json({ reservations });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getActiveReservationForUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const reservation = await Reservation.findOne({
            $or: [{ userId: userId }, { userEmail: userId }],
            reservationStatus: "reserved"
        }).sort({ createdAt: -1 });

        res.json({ reservation });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ================= PAY RESERVATION PENALTY ================= */
export const payReservationPenalty = async (req, res) => {
    try {
        const { reservationId } = req.body;
        const reservation = await Reservation.findById(reservationId);
        if (!reservation) return res.status(404).json({ message: "Reservation not found" });

        reservation.penaltyStatus = "paid";
        reservation.penaltyPaidAt = new Date();
        await reservation.save();

        // Decrease user's pendingPenalties counter
        // Assuming reservation.penaltyAmount is already calculated based on a rate (e.g., 2)
        // If the penalty amount needs to be recalculated here, more context is needed.
        await User.findOneAndUpdate(
            { $or: [{ _id: reservation.userId }, { email: reservation.userEmail }] }, // Updated filter to use userEmail from reservation
            { $inc: { pendingPenalties: -reservation.penaltyAmount } }
        );

        res.json({ message: "Penalty paid successfully", reservation });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ================= CHECK PENDING PENALTY ================= */
export const getPendingPenalty = async (req, res) => {
    try {
        const { userId } = req.params;
        const pendingReservation = await Reservation.findOne({
            $or: [{ userId: userId }, { userEmail: userId }],
            reservationStatus: "expired",
            penaltyStatus: "pending"
        }).sort({ createdAt: -1 });

        res.json({ hasPending: !!pendingReservation, reservation: pendingReservation });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ================= GET MISSED RESERVATIONS (HISTORY) ================= */
export const getMissedReservations = async (req, res) => {
    try {
        const { userId } = req.params;
        const missed = await Reservation.find({
            $or: [{ userId: userId }, { userEmail: userId }],
            reservationStatus: "expired",
            penaltyApplied: true
        }).sort({ createdAt: -1 });

        res.json({ reservations: missed });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ================= ADMIN: ALL EXPIRED RESERVATIONS ================= */
export const getAllExpiredReservations = async (req, res) => {
    try {
        const expired = await Reservation.find({
            reservationStatus: "expired",
            penaltyApplied: true
        }).sort({ createdAt: -1 });

        res.json({ reservations: expired });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
