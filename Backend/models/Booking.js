// models/Booking.js
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  userId: String,
  ticketId: String,
  slotId: {
    type: String
  },
  areaId: {
    type: String
  },
  areaName: {
    type: String
  },
  vehicleType: {
    type: String
  },
  entryTime: Date,
  expectedExit: Date,
  actualExit: Date,
  paidAmount: Number,
  penaltyAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["active", "completed"],
    default: "active"
  },
  // Email Automations Tracking
  userEmail: {
    type: String
  },
  userName: {
    type: String
  },
  warningEmailSent: {
    type: Boolean,
    default: false
  },
  penaltyEmailSent: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
});

export default mongoose.model("Booking", bookingSchema);
