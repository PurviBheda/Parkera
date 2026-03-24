import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        userEmail: {
            type: String,
        },
        parkingAreaId: {
            type: String,
            required: true,
        },
        slotId: {
            type: String,
            required: true,
        },
        vehicleType: {
            type: String,
            required: true,
        },
        // time when the reservation was made
        bookingTime: {
            type: Date,
            default: Date.now,
        },
        // in minutes
        ETA: {
            type: Number,
            required: true,
        },
        // in minutes
        bufferTime: {
            type: Number,
            default: 5,
        },
        // bookingTime + ETA + bufferTime
        reservationExpiryTime: {
            type: Date,
            required: true,
        },
        // pending, active, completed, expired, cancelled
        reservationStatus: {
            type: String,
            enum: ["reserved", "occupied", "expired", "cancelled"],
            default: "reserved",
        },
        arrivalStatus: {
            type: Boolean,
            default: false,
        },
        penaltyApplied: {
            type: Boolean,
            default: false,
        },
        penaltyAmount: {
            type: Number,
            default: 0,
        },
        parkingStartTime: {
            type: Date,
        },
        // To identify if this reservation is still blocking the slot
        isBlockingSlot: {
            type: Boolean,
            default: true
        },
        // AutoPay preference
        autoPenalty: {
            type: Boolean,
            default: true,
        },
        // Penalty payment status
        penaltyStatus: {
            type: String,
            enum: ["none", "paid", "pending"],
            default: "none",
        },
        penaltyPaidAt: {
            type: Date,
            default: null,
        },
        warningEmailSent: {
            type: Boolean,
            default: false,
        },
        penaltyEmailSent: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Pre-save hook to automatically compute expiry time if not provided, though it's better to pass it explicitly.
// keeping it explicit in the controller is fine.

export default mongoose.model("Reservation", reservationSchema);
