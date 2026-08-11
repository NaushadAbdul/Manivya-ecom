import mongoose from 'mongoose';
import dns from 'dns';

export const connectDB = async () => {
  try {
    // Configure DNS resolution fallback for Windows SRV queries
    if (process.platform === 'win32') {
      try {
        dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
      } catch (e) {}
    }

    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/manivya';
    const conn = await mongoose.connect(connStr);
    console.log(`[MongoDB Atlas] Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Atlas] Connection Error: ${(error as Error).message}`);
    console.warn('[MongoDB Atlas] Operating with fallback mode if offline.');
  }
};
