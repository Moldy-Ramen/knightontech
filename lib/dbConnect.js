// lib/dbConnect.js

import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    // Use your own Mongo URI in .env.local
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
};

if (!MONGO_URI) {
  throw new Error('Please define the MONGO_URI environment variable inside .env.local');
}

/**
 * Global is used here so that the value is preserved across module reloads in development.
 * @type {{conn: null | import('mongoose').Mongoose, promise: null | Promise<import('mongoose').Mongoose>}}
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // any other mongoose options you need
    };
    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;