import mongoose from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/perplexity";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URL);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    throw err;
  }
};

export default connectDB;