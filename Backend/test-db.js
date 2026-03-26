import mongoose from 'mongoose';
import fs from 'fs';

const uri = "mongodb+srv://parkera:purviparkera@cluster0.gsqnz4h.mongodb.net/parkeradb";

const run = async () => {
  try {
    await mongoose.connect(uri);
    // Find all bookings sorted by _id desc to get the most recent ones
    const bookings = await mongoose.connection.db.collection('bookings').find({}).sort({_id: -1}).limit(10).toArray();
    fs.writeFileSync('db_out_utf8.json', JSON.stringify(bookings, null, 2), 'utf8');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
};

run();
