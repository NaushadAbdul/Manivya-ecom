"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const dns_1 = __importDefault(require("dns"));
const User_1 = __importDefault(require("../models/User"));
const Coupon_1 = __importDefault(require("../models/Coupon"));
const Warehouse_1 = __importDefault(require("../models/Warehouse"));
const DeliveryPartner_1 = __importDefault(require("../models/DeliveryPartner"));
dotenv_1.default.config();
const seedData = async () => {
    try {
        try {
            dns_1.default.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
        }
        catch (e) { }
        const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/manivya';
        await mongoose_1.default.connect(connStr);
        console.log('[Seed] Connected to MongoDB Atlas...');
        // Clear existing system records (Preserve admin products & categories)
        await User_1.default.deleteMany({});
        await Coupon_1.default.deleteMany({});
        await Warehouse_1.default.deleteMany({});
        await DeliveryPartner_1.default.deleteMany({});
        console.log('[Seed] Cleared system records while preserving user products & categories...');
        // Create Admin & Test Customer
        const admin = await User_1.default.create({
            uid: 'uid-admin-manivya',
            name: 'MANIVYA Admin',
            email: 'admin@manivya.com',
            phone: '+91 98765 43210',
            role: 'admin',
            provider: 'password',
        });
        const adminNaushad = await User_1.default.create({
            uid: 'uid-naushadabdul2006gmailcom',
            name: 'Naushad Abdul',
            email: 'naushadabdul2006@gmail.com',
            phone: '+91 98765 43211',
            role: 'admin',
            provider: 'google',
        });
        const customer = await User_1.default.create({
            uid: 'uid-customer-demo',
            name: 'Rahul Sharma',
            email: 'rahul@example.com',
            phone: '+91 91234 56789',
            role: 'customer',
            provider: 'google',
        });
        console.log(`[Seed] Created Users: Admin (${admin.email}), Admin (${adminNaushad.email}), Customer (${customer.email})`);
        // Categories (No hardcoded sample categories inserted — 100% admin database managed)
        console.log('[Seed] Category collection left clean for admin database management...');
        // Products (No sample products inserted — fully database driven)
        console.log('[Seed] Product collection left clean for user database management...');
        // Coupons
        await Coupon_1.default.create([
            {
                code: 'MANIVYA10',
                discountType: 'percentage',
                discountValue: 10,
                minOrderAmount: 1000,
                maxDiscount: 1500,
                expiryDate: new Date('2027-12-31'),
                usageLimit: 500,
            },
            {
                code: 'WELCOME500',
                discountType: 'fixed',
                discountValue: 500,
                minOrderAmount: 2999,
                expiryDate: new Date('2027-12-31'),
                usageLimit: 200,
            },
        ]);
        // Create Warehouses
        const vizagWarehouse = await Warehouse_1.default.create({
            name: 'MANIVYA Visakhapatnam Central Hub',
            code: 'WH-VTZ-01',
            fullAddress: '25-1-13, Gajuwaka Bypass Rd, Durgavanipalem, Pedagantyada, Visakhapatnam, Gajuwaka',
            area: 'Durgavanipalem, Gajuwaka',
            city: 'Visakhapatnam',
            state: 'Andhra Pradesh',
            country: 'India',
            postalCode: '530026',
            latitude: 17.6868,
            longitude: 83.2185,
            managerName: 'K. Venkat Rao',
            managerPhone: '+91 89123 45678',
            supportedRadiusKm: 500,
        });
        await Warehouse_1.default.create({
            name: 'MANIVYA Metro West Hub',
            code: 'WH-BOM-02',
            fullAddress: 'Plot 42, BKC Industrial Zone, Bandra East',
            area: 'BKC',
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
            postalCode: '400051',
            latitude: 19.076,
            longitude: 72.8777,
            managerName: 'Suresh Patil',
            managerPhone: '+91 98200 11223',
            supportedRadiusKm: 500,
        });
        console.log('[Seed] Created Warehouses (Vizag Central & Metro West)...');
        // Create Delivery Partners
        await DeliveryPartner_1.default.create([
            {
                partnerId: 'DP-1001',
                name: 'MANIVYA Express Fleet (Suresh Kumar)',
                phone: '+91 98480 12345',
                vehicleType: 'Van',
                providerType: 'Internal',
                availability: 'Available',
                rating: 4.9,
            },
            {
                partnerId: 'DP-1002',
                name: 'Delhivery Surface Express',
                phone: '+91 1800 103 6354',
                vehicleType: 'Truck',
                providerType: 'Delhivery',
                availability: 'Available',
                rating: 4.8,
            },
            {
                partnerId: 'DP-1003',
                name: 'BlueDart Air Priority Fleet',
                phone: '+91 1860 233 1234',
                vehicleType: 'Van',
                providerType: 'BlueDart',
                availability: 'Available',
                rating: 4.9,
            },
        ]);
        console.log('[Seed] Created Delivery Partners (Internal, Delhivery, BlueDart)...');
        console.log('[Seed] Complete! Database is ready for production use.');
        process.exit(0);
    }
    catch (err) {
        console.error('[Seed Error]', err);
        process.exit(1);
    }
};
seedData();
