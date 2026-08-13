import { Router } from 'express';
import {
  uploadPaymentProof,
  getPendingPaymentsAdmin,
  verifyPaymentAdmin,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from '../controllers/paymentController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

router.post('/upload-proof', authenticate, upload.single('proof'), uploadPaymentProof);
router.post('/razorpay/create-order', authenticate, createRazorpayOrder);
router.post('/razorpay/verify', authenticate, verifyRazorpayPayment);

// Admin Moderation Routes
router.get('/pending', authenticate, requireAdmin, getPendingPaymentsAdmin);
router.patch('/verify/:paymentId', authenticate, requireAdmin, verifyPaymentAdmin);

export default router;
