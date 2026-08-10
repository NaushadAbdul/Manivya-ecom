import { Router } from 'express';
import { uploadPaymentProof, getPendingPaymentsAdmin, verifyPaymentAdmin } from '../controllers/paymentController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

router.post('/upload-proof', authenticate, upload.single('proof'), uploadPaymentProof);

// Admin Moderation Routes
router.get('/pending', authenticate, requireAdmin, getPendingPaymentsAdmin);
router.patch('/verify/:paymentId', authenticate, requireAdmin, verifyPaymentAdmin);

export default router;
