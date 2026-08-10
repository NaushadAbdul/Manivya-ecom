import { Router } from 'express';
import { validateCoupon, getCouponsAdmin, createCouponAdmin, deleteCouponAdmin } from '../controllers/couponController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

router.post('/validate', validateCoupon);
router.get('/admin', authenticate, requireAdmin, getCouponsAdmin);
router.post('/admin', authenticate, requireAdmin, createCouponAdmin);
router.delete('/admin/:id', authenticate, requireAdmin, deleteCouponAdmin);

export default router;
