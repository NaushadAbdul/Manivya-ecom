import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';

dotenv.config();

let lastDbError: string | null = null;
let isDbConnected = false;

// Configure DNS defaults for Node.js DNS SRV resolution across platforms
try {
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (e) {
  // Ignore if unsupported in environment
}

const applyDnsFix = () => {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  } catch (e) {
    // Ignore if custom DNS setting is restricted by host environment
  }
};

// Apply DNS fallback initially
applyDnsFix();

// Listen to Mongoose connection events
mongoose.connection.on('connected', () => {
  isDbConnected = true;
  lastDbError = null;
  console.log('[MongoDB Atlas Event] Database connection established.');
});

mongoose.connection.on('error', (err) => {
  isDbConnected = false;
  lastDbError = err.message;
  console.error('[MongoDB Atlas Event] Connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  isDbConnected = false;
  console.warn('[MongoDB Atlas Event] Database disconnected.');
});

mongoose.connection.on('reconnected', () => {
  isDbConnected = true;
  lastDbError = null;
  console.log('[MongoDB Atlas Event] Database reconnected successfully.');
});

export const getDbStatus = () => ({
  isConnected: isDbConnected || mongoose.connection.readyState === 1,
  readyState: mongoose.connection.readyState,
  lastError: lastDbError,
  hasUri: !!process.env.MONGODB_URI,
});

export const connectDB = async () => {
  try {
    applyDnsFix();

    const rawUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/manivya';
    const connStr = rawUri.replace(/^["']|["']$/g, '').trim();
    const maskedUri = connStr.replace(/:([^@]+)@/, ':****@');
    console.log(`[MongoDB Atlas] Attempting connection with URI: ${maskedUri}`);

    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 30000,
    });

    isDbConnected = true;
    lastDbError = null;
    console.log(`[MongoDB Atlas] Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    // If SRV lookup failed, re-apply DNS fix and attempt one fallback retry
    const errMsg = (error as Error).message;
    if (errMsg.includes('querySrv') || errMsg.includes('ENOTFOUND') || errMsg.includes('ECONNREFUSED')) {
      console.warn('[MongoDB Atlas] SRV resolution issue detected. Retrying with explicit DNS servers...');
      applyDnsFix();
      try {
        const rawUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/manivya';
        const connStr = rawUri.replace(/^["']|["']$/g, '').trim();
        const conn = await mongoose.connect(connStr, {
          serverSelectionTimeoutMS: 20000,
          connectTimeoutMS: 30000,
        });
        isDbConnected = true;
        lastDbError = null;
        console.log(`[MongoDB Atlas Retry] Connected successfully: ${conn.connection.host}`);
        return conn;
      } catch (retryErr) {
        isDbConnected = false;
        lastDbError = (retryErr as Error).message;
        console.error(`[MongoDB Atlas Retry] Failed: ${lastDbError}`);
        throw new Error(`Database Connection Failed: ${lastDbError}`);
      }
    }

    isDbConnected = false;
    lastDbError = errMsg;
    console.error(`[MongoDB Atlas] Connection Error: ${lastDbError}`);
    throw new Error(`Database Connection Failed: ${lastDbError}`);
  }
};

