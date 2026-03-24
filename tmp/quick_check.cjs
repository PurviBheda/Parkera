
const mongoose = require('mongoose');
const mongoUri = "mongodb://localhost:27017/parkera"; // Fallback to local if env fails

async function verify() {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB via local URI");

    const Booking = mongoose.model('Booking', new mongoose.Schema({ status: String, ticketId: String, expectedExit: Date }));
    const Reservation = mongoose.model('Reservation', new mongoose.Schema({ reservationStatus: String, penaltyApplied: Boolean, userId: String }));

    const activeBookings = await Booking.find({ status: "active" });
    console.log(`Active Bookings: ${activeBookings.length}`);

    const expiredReservations = await Reservation.find({ reservationStatus: "expired" });
    console.log(`Expired Reservations: ${expiredReservations.length}`);

    const reservedReservations = await Reservation.find({ reservationStatus: "reserved" });
    console.log(`Reserved Reservations: ${reservedReservations.length}`);

    await mongoose.disconnect();
  } catch (err) {
    console.error("Verification Error:", err.message);
  }
}

verify();
