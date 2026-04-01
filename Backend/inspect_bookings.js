import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const bookings = await mongoose.connection.db.collection('bookings').find({ 
      slotId: { $in: ['C-16', 'C-17', 'C-30'] }, 
      status: 'active' 
    }).toArray();
    console.log(JSON.stringify(bookings, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
};

run();
