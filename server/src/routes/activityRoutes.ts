import { Router } from 'express';
import { getLoginActivity, logProductActivity, getProductActivities } from '../controllers/activityController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/login-activity', authenticate, requireAdmin, getLoginActivity);
router.post('/product', logProductActivity);
router.get('/products', authenticate, requireAdmin, getProductActivities);

export default router;
