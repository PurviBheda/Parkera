import mongoose from "mongoose";

const slotSchema = new mongoose.Schema({
  slotNumber: String,
  isOccupied: {
    type: Boolean,
    default: false
  }
});

export default mongoose.model("Slot", slotSchema);
