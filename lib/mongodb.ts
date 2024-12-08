import mongoose from 'mongoose';

import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || '';

if (!MONGO_URI) {
  throw new Error('Please add MONGO_URI to the .env');
}

let isConnected = false;

export async function connectToDatabase() {
  if (isConnected) return;

  try {
    await mongoose.connect(MONGO_URI);
    isConnected = true;
    console.log('Connection to MongoDB is established');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

export default connectToDatabase;