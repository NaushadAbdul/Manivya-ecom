import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { initFirebaseAdmin } from './config/firebase';
import { errorHandler } from './middleware/errorHandler';

// Route Imports
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import orderRoutes from './routes/orderRoutes';
import paymentRoutes from './routes/paymentRoutes';
import addressRoutes from './routes/addressRoutes';
import reviewRoutes from './routes/reviewRoutes';
import couponRoutes from './routes/couponRoutes';
import recommendationRoutes from './routes/recommendationRoutes';
import notificationRoutes from './routes/notificationRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import logisticsRoutes from './routes/logisticsRoutes';
import activityRoutes from './routes/activityRoutes';
import wishlistRoutes from './routes/wishlistRoutes';
import showcaseRoutes from './routes/showcaseRoutes';
import hero3dRoutes from './routes/hero3dRoutes';
import themeRoutes from './routes/themeRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database & Firebase
connectDB();
initFirebaseAdmin();

// Global Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));

const rawClientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = rawClientUrl.split(',').map((url) => url.trim().replace(/\/+$/, ''));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin.replace(/\/+$/, '')) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy blocked access from origin: ${origin}`));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/showcase', showcaseRoutes);
app.use('/api/hero-3d', hero3dRoutes);
app.use('/api/theme', themeRoutes);

// Healthcheck Route
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    service: 'MANIVYA Enterprises E-Commerce API',
    timestamp: new Date(),
  });
});

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 MANIVYA REST API Server running on port ${PORT}`);
  console.log(`==================================================\n`);
});
