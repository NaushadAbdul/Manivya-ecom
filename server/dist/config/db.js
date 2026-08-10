"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dns_1 = __importDefault(require("dns"));
const connectDB = async () => {
    try {
        // Configure DNS resolution fallback for Windows SRV queries
        try {
            dns_1.default.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
        }
        catch (e) { }
        const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/manivya';
        const conn = await mongoose_1.default.connect(connStr);
        console.log(`[MongoDB Atlas] Connected successfully: ${conn.connection.host}`);
    }
    catch (error) {
        console.error(`[MongoDB Atlas] Connection Error: ${error.message}`);
        console.warn('[MongoDB Atlas] Operating with fallback mode if offline.');
    }
};
exports.connectDB = connectDB;
