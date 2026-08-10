import { Router } from 'express';
import { getMyNotifications, markNotificationRead, markAllNotificationsRead } from '../controllers/notificationController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticate, getMyNotifications);
router.patch('/:id/read', authenticate, markNotificationRead);
router.patch('/read-all', authenticate, markAllNotificationsRead);

export default router;
