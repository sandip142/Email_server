const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: "./.env" });
const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}`, {

    });
    console.log('MongoDB Connected...');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
