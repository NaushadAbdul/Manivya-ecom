import mongoose from 'mongoose';
import dns from 'dns';

let lastDbError: string | null = null;
let isDbConnected = false;

export const getDbStatus = () => ({
  isConnected: isDbConnected || mongoose.connection.readyState === 1,
  readyState: mongoose.connection.readyState,
  lastError: lastDbError,
  hasUri: !!process.env.MONGODB_URI,
});

export const connectDB = async () => {
  try {
    if (process.platform === 'win32') {
      try {
        dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
      } catch (e) {}
    }

    const rawUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/manivya';
    const connStr = rawUri.replace(/^["']|["']$/g, '').trim();
    const maskedUri = connStr.replace(/:([^@]+)@/, ':****@');
    console.log(`[MongoDB Atlas] Attempting connection with URI: ${maskedUri}`);

    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    isDbConnected = true;
    lastDbError = null;
    console.log(`[MongoDB Atlas] Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    isDbConnected = false;
    lastDbError = (error as Error).message;
    console.error(`[MongoDB Atlas] Connection Error: ${lastDbError}`);
    throw new Error(`Database Connection Failed: ${lastDbError}`);
  }
};
