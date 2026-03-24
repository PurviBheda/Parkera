import mongoose from "mongoose";
import dotenv from "dotenv";
import Booking from "./models/Booking.js";
import Reservation from "./models/Reservation.js";

dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  const lastBookings = await Booking.find().sort({ createdAt: -1 }).limit(5);
  console.log("--- Last 5 Bookings ---");
  lastBookings.forEach(b => {
    console.log(`Booking ID: ${b._id} | userEmail: ${b.userEmail} | status: ${b.status} | createdAt: ${b.createdAt}`);
    console.log(`  Data: ${JSON.stringify({ userId: b.userId, ticketId: b.ticketId, areaName: b.areaName })}`);
  });

  const lastReservations = await Reservation.find().sort({ createdAt: -1 }).limit(5);
  console.log("\n--- Last 5 Reservations ---");
  lastReservations.forEach(r => {
    console.log(`Resv ID: ${r._id} | userEmail: ${r.userEmail} | status: ${r.reservationStatus} | createdAt: ${r.createdAt}`);
    console.log(`  Data: ${JSON.stringify({ userId: r.userId, slotId: r.slotId })}`);
  });

  process.exit();
}

check();
