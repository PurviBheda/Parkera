import mongoose from "mongoose";

const parkingPassSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    areaId: {
        type: String,
        required: true
    },
    areaName: {
        type: String,
        required: true
    },
    slotId: {
        type: String,
        required: true
    },
    passType: {
        type: String, // "15 Days", "1 Month", "3 Months"
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["active", "expired"],
        default: "active"
    }
}, { timestamps: true });

export default mongoose.model("ParkingPass", parkingPassSchema);
