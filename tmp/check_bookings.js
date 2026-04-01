import mongoose from 'mongoose';
import Booking from './Backend/models/Booking.js';

const uri = "mongodb+srv://parkera:purvibarkera@cluster0.gsqnz4h.mongodb.net/parkeradb";

const run = async () => {
  try {
    // Wait, the test-db.js had a different URI: mongodb+srv://parkera:purviparkera@cluster0.gsqnz4h.mongodb.net/parkeradb
    // This looks like the same cluster but maybe different password?
    
    await mongoose.connect("mongodb+srv://purvibheda7:Purvi2004@cluster0.p7itf.mongodb.net/ParkFlow?retryWrites=true&w=majority");
    
    const bookings = await Booking.find({ slotId: { $in: ['C-16', 'C-17'] }, status: 'active' });
    console.log(JSON.stringify(bookings, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
};

run();
