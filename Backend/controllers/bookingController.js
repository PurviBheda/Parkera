// controllers/bookingController.js

import Booking from "../models/Booking.js";
import Slot from "../models/Slot.js";
import ParkingArea from "../models/ParkingArea.js";
import { sendBookingConfirmationInternal } from "./notificationController.js";

export const createBooking = async (req, res) => {
  try {
    const { userId, ticketId, slotId, areaId, areaName, vehicleType, entryTime, expectedExit, paidAmount, userEmail, userName } = req.body;
    // Safety fallback
    const finalEmail = userEmail || userId;

    // Create tracking booking
    const newBooking = new Booking({
      userId,
      ticketId,
      slotId,
      areaId,
      areaName,
      vehicleType,
      entryTime,
      expectedExit,
      paidAmount,
      userEmail: finalEmail,
      userName: userName || "Guest",
      status: "active"
    });
    const savedBooking = await newBooking.save();

    console.log("🎟️ Booking Created:", savedBooking._id);

    // Fire Autonomous Confirmation Email
    if (finalEmail) {
      setImmediate(() => {
        sendBookingConfirmationInternal(finalEmail, areaName, slotId, vehicleType || "Car/Bike", entryTime, expectedExit)
          .catch(err => console.error("📧 Background Email Error:", err));
      });
    }

    res.status(201).json({ message: "Booking successful", booking: savedBooking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const confirmExit = async (req, res) => {
  try {
    const { ticketId } = req.body;
    console.log("Confirming exit for ticketId:", ticketId);

    const booking = await Booking.findOne({ ticketId });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const now = new Date();
    booking.actualExit = now;

    // Calculate penalty
    if (now > booking.expectedExit) {
      const lateMinutes = Math.ceil(
        (now - booking.expectedExit) / (1000 * 60)
      );

      booking.penaltyAmount = lateMinutes * 2; // ₹2 per minute
      await booking.save();

      return res.json({
        penalty: booking.penaltyAmount,
        requiresPayment: true
      });
    }

    // No penalty case
    booking.status = "completed";
    await booking.save();

    res.json({ requiresPayment: false });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const payBookingPenalty = async (req, res) => {
  try {
    const { ticketId, penaltyAmount } = req.body;
    console.log("💰 Paying Penalty for ticketId:", ticketId, "Amount:", penaltyAmount);

    const booking = await Booking.findOne({ ticketId });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = "completed";
    booking.penaltyAmount = penaltyAmount || booking.penaltyAmount;
    booking.actualExit = new Date();
    await booking.save();

    console.log("✅ Penalty Paid & Booking Completed:", ticketId);
    res.json({ message: "Penalty paid and booking completed", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookingHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Fetching History for USERID:", userId);

    // Search by both ID and Email to ensure consistency
    const history = await Booking.find({
      $or: [{ userId: userId }, { userEmail: userId }],
      status: "completed"
    }).sort({ entryTime: -1 });

    console.log("Found History Count:", history.length);
    res.json({ history });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ entryTime: -1 });
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addFeedback = async (req, res) => {
  try {
    const { bookingId, rating } = req.body;

    let booking;

    // 1. Try Ticket ID first since it's the most common from frontend
    booking = await Booking.findOne({ ticketId: bookingId });

    // 2. Fallback to MongoDB _id if not found and it's a valid ObjectId
    if (!booking && mongoose.Types.ObjectId.isValid(bookingId)) {
      booking = await Booking.findById(bookingId);
    }

    if (!booking) {
      console.log("❌ Feedback Failed: Booking not found for ID:", bookingId);
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.rating = rating;
    await booking.save();
    console.log("⭐ Feedback Saved for:", bookingId, "Rating:", rating);

    res.json({ message: "Feedback submitted successfully" });
  } catch (error) {
    console.error("❌ Feedback Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
