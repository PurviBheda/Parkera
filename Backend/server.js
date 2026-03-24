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
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

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

initializeCronJobs(); // Start automated email loop

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
// Nodemon trigger