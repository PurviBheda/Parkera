import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    vehicle: {
      type: String,
      required: true,
      unique: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      default: "user",
      enum: ["user", "admin"],
    },

    // 🔥 OTP Fields
    otp: {
      type: String,
    },

    otpExpire: {
      type: Date,
    },

    // Wallet & Penalty features
    walletBalance: {
      type: Number,
      default: 0,
    },
    pendingPenalties: {
      type: Number,
      default: 0,
    },

    // Profile Photo features
    profilePhotos: {
      type: [String],
      default: [],
      validate: [arr => arr.length <= 3, 'Maximum 3 profile photos allowed'],
    },
    activePhoto: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);