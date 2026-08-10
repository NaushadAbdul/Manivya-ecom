"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const firebase_1 = require("./config/firebase");
const errorHandler_1 = require("./middleware/errorHandler");
// Route Imports
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const addressRoutes_1 = __importDefault(require("./routes/addressRoutes"));
const reviewRoutes_1 = __importDefault(require("./routes/reviewRoutes"));
const couponRoutes_1 = __importDefault(require("./routes/couponRoutes"));
const recommendationRoutes_1 = __importDefault(require("./routes/recommendationRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const logisticsRoutes_1 = __importDefault(require("./routes/logisticsRoutes"));
const activityRoutes_1 = __importDefault(require("./routes/activityRoutes"));
const wishlistRoutes_1 = __importDefault(require("./routes/wishlistRoutes"));
const showcaseRoutes_1 = __importDefault(require("./routes/showcaseRoutes"));
const hero3dRoutes_1 = __importDefault(require("./routes/hero3dRoutes"));
const themeRoutes_1 = __importDefault(require("./routes/themeRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Connect Database & Firebase
(0, db_1.connectDB)();
(0, firebase_1.initFirebaseAdmin)();
// Global Middleware
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: false }));
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express_1.default.json({ limit: '15mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '15mb' }));
app.use((0, morgan_1.default)('dev'));
// API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/products', productRoutes_1.default);
app.use('/api/categories', categoryRoutes_1.default);
app.use('/api/orders', orderRoutes_1.default);
app.use('/api/payments', paymentRoutes_1.default);
app.use('/api/addresses', addressRoutes_1.default);
app.use('/api/reviews', reviewRoutes_1.default);
app.use('/api/coupons', couponRoutes_1.default);
app.use('/api/recommendations', recommendationRoutes_1.default);
app.use('/api/notifications', notificationRoutes_1.default);
app.use('/api/analytics', analyticsRoutes_1.default);
app.use('/api/logistics', logisticsRoutes_1.default);
app.use('/api/activity', activityRoutes_1.default);
app.use('/api/wishlist', wishlistRoutes_1.default);
app.use('/api/showcase', showcaseRoutes_1.default);
app.use('/api/hero-3d', hero3dRoutes_1.default);
app.use('/api/theme', themeRoutes_1.default);
// Healthcheck Route
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'online',
        service: 'MANIVYA Enterprises E-Commerce API',
        timestamp: new Date(),
    });
});
// Global Error Handler
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 MANIVYA REST API Server running on port ${PORT}`);
    console.log(`==================================================\n`);
});
