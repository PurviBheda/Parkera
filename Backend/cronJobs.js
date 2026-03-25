import mongoose from "mongoose";
import cron from "node-cron";
import Booking from "./models/Booking.js";
import ParkingPass from "./models/ParkingPass.js";
import Reservation from "./models/Reservation.js";
import User from "./models/User.js";
import { sendWarningEmailInternal, sendPenaltyEmailInternal } from "./controllers/notificationController.js";

// Run every 1 minute
export const initializeCronJobs = () => {
    cron.schedule("* * * * *", async () => {
        try {
            console.log("⏳ [Cron] Running automated booking checks...");
            const activeBookings = await Booking.find({ status: "active" });
            const now = new Date();

            // 1. Automated Booking Checks
            for (const booking of activeBookings) {
                if (!booking.userEmail) continue;

                const expectedExit = new Date(booking.expectedExit);
                const timeDiffMins = (expectedExit.getTime() - now.getTime()) / 60000;

                const bookingInfo = {
                    areaName: booking.areaName || "N/A",
                    slotId: booking.slotId || "N/A",
                    expectedExit: booking.expectedExit,
                    isReservation: false
                };

                // Send Warning Email (Background)
                if (timeDiffMins <= 5 && timeDiffMins > 0 && !booking.warningEmailSent) {
                    booking.warningEmailSent = true;
                    await booking.save();
                    sendWarningEmailInternal(booking.userEmail, bookingInfo)
                        .catch(err => console.error("📧 [Cron] Warning Email Error:", err));
                }

                // Send Penalty Email (Background)
                if (timeDiffMins <= 0 && !booking.penaltyEmailSent) {
                    booking.penaltyEmailSent = true;
                    await booking.save();
                    sendPenaltyEmailInternal(booking.userEmail, bookingInfo)
                        .catch(err => console.error("📧 [Cron] Penalty Email Error:", err));
                }
            }

            console.log("⏳ [Cron] Running automated reservation checks...");
            const activeReservations = await Reservation.find({ reservationStatus: "reserved" });

            // 2. Automated Reservation Checks
            for (const resv of activeReservations) {
                if (!resv.userEmail) continue;

                const expiryTime = new Date(resv.reservationExpiryTime);
                const timeDiffMins = (expiryTime.getTime() - now.getTime()) / 60000;

                const resvInfo = {
                    areaName: "Selected Parking Area",
                    slotId: resv.slotId || "N/A",
                    expectedExit: resv.reservationExpiryTime,
                    isReservation: true
                };

                // Send Warning Email (Background)
                if (timeDiffMins <= 5 && timeDiffMins > 0 && !resv.warningEmailSent) {
                    resv.warningEmailSent = true;
                    await resv.save();
                    sendWarningEmailInternal(resv.userEmail, resvInfo)
                        .catch(err => console.error("📧 [Cron] Resv Warning Error:", err));
                }

                // Send Penalty Email (Background)
                if (timeDiffMins <= 0 && !resv.penaltyEmailSent) {
                    resv.penaltyEmailSent = true;
                    await resv.save();
                    sendPenaltyEmailInternal(resv.userEmail, resvInfo)
                        .catch(err => console.error("📧 [Cron] Resv Penalty Error:", err));
                }
            }

            console.log("⏳ [Cron] Running automated parking pass checks...");
            // ... (rest of the existing logic for passes, reservation expiry, etc.)
            const expiredPasses = await ParkingPass.updateMany(
                { status: "active", endDate: { $lt: now } },
                { $set: { status: "expired" } }
            );
            if (expiredPasses.modifiedCount > 0) {
                console.log(`✅ [Cron] Expired ${expiredPasses.modifiedCount} parking passes.`);
            }

            console.log("⏳ [Cron] Running automated reservation expiry checks...");
            const expiredReservations = await Reservation.find({
                reservationStatus: "reserved",
                reservationExpiryTime: { $lt: now }
            });

            for (const resv of expiredReservations) {
                // Mark as expired and release slot
                resv.reservationStatus = "expired";
                resv.penaltyApplied = true;

                const penaltyValue = 15;
                resv.penaltyAmount = penaltyValue;
                resv.isBlockingSlot = false;

                if (resv.autoPenalty) {
                    // AutoPay ON: automatically charge
                    resv.penaltyStatus = "paid";
                    resv.penaltyPaidAt = new Date();
                    console.log(`💳 [Cron] AutoPay: Penalty ₹${penaltyValue} auto-charged for user ${resv.userId}`);
                } else {
                    // AutoPay OFF: mark as pending for manual payment
                    resv.penaltyStatus = "pending";
                    // Add to user's pending penalties
                    const userQuery = mongoose.Types.ObjectId.isValid(resv.userId)
                        ? { $or: [{ _id: resv.userId }, { email: resv.userId }] }
                        : { email: resv.userId };

                    await User.findOneAndUpdate(
                        userQuery,
                        { $inc: { pendingPenalties: penaltyValue } }
                    );
                    console.log(`⏳ [Cron] Penalty ₹${penaltyValue} pending for user ${resv.userId}`);
                }

                await resv.save();
                console.log(`❌ [Cron] Reservation Expired for user ${resv.userId}`);
            }

        } catch (error) {
            console.error("❌ [Cron] Error running cron checks:", error);
        }
    });
    console.log("⏱️ Automated Email Cron Jobs Initialized");
};
