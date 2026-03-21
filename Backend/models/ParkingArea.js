import mongoose from "mongoose";

const parkingAreaSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        address: { type: String, required: true },
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        rating: { type: Number, required: true },
        pricePerHour: { type: Number, required: true },
        totalSlots: { type: Number, required: true },
        availableSlots: {
            car: { type: Number, required: true },
            bike: { type: Number, required: true },
            scooty: { type: Number, required: true },
        },
    },
    { timestamps: true }
);

export default mongoose.model("ParkingArea", parkingAreaSchema);
