
import mongoose from 'mongoose';
import Booking from './models/Booking.js';
import Reservation from './models/Reservation.js';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

async function verify() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const activeBookings = await Booking.find({ status: "active" });
    console.log(`Active Bookings: ${activeBookings.length}`);
    activeBookings.forEach(b => {
        const now = new Date();
        if (now > b.expectedExit) {
            console.log(`- Overdue Booking: ${b.ticketId}, Expected Exit: ${b.expectedExit}`);
        }
    });

    const expiredReservations = await Reservation.find({ reservationStatus: "expired" });
    console.log(`Expired Reservations: ${expiredReservations.length}`);
    expiredReservations.forEach(r => {
        console.log(`- Expired Resv: ${r._id}, User: ${r.userId}, Penalty: ${r.penaltyAmount}, Status: ${r.penaltyStatus}`);
    });

    const reservedReservations = await Reservation.find({ reservationStatus: "reserved" });
    console.log(`Reserved (Active) Reservations: ${reservedReservations.length}`);
    reservedReservations.forEach(r => {
        const now = new Date();
        if (now > r.reservationExpiryTime) {
            console.log(`- Overdue Resv: ${r._id}, Expiry: ${r.reservationExpiryTime}`);
        }
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

verify();
