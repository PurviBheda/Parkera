import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import bookingRoutes from "./routes/bookingRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import parkingAreaRoutes from "./routes/parkingAreaRoutes.js";
import passRoutes from "./routes/passRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import { initializeCronJobs } from "./cronJobs.js";

dotenv.config();

const app = express();

/* ---------------- CORS CONFIG ---------------- */
/*
  origin: true → allows current frontend origin automatically
  credentials: true → allows cookies / auth headers if needed
*/
app.use(cors({
  origin: true,
  credentials: true
}));

/* ---------------- MIDDLEWARE ---------------- */
app.use(express.json({ limit: '15mb' }));

/* ---------------- MONGODB CONNECTION ---------------- */
if (!process.env.MONGO_URI) {
  console.error("❌ CRITICAL: MONGO_URI is missing in environment variables!");
} else {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch((err) => console.log("❌ MongoDB Connection Error:", err));
}

/* ---------------- ROUTES ---------------- */
app.use("/api/bookings", bookingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/parking-areas", parkingAreaRoutes);
app.use("/api/passes", passRoutes);
app.use("/api/reservations", reservationRoutes);

/* ---------------- DEFAULT ROUTE ---------------- */
app.get("/", (req, res) => {
  res.send("🚀 Parkera Backend Running...");
});

/* ---------------- SERVER START ---------------- */
const PORT = process.env.PORT || 5000;

console.log(`⏱️ Starting server on port ${PORT}...`);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server fully operational on port ${PORT}`);
  console.log(`🔗 Local URL: http://localhost:${PORT}`);
  
  // Start background tasks AFTER server is up
  try {
    initializeCronJobs();
    console.log("⏱️ Automated Email Cron Jobs Initialized");
  } catch (err) {
    console.error("❌ Failed to initialize cron jobs:", err);
  }
});
// Nodemon trigger