import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  cancelOrder,
} from '../controllers/orderController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticate, createOrder);
router.get('/my', authenticate, getMyOrders);
router.get('/:id', authenticate, getOrderById);
router.post('/:id/cancel', authenticate, cancelOrder);

// Admin Routes
router.get('/admin/all', authenticate, requireAdmin, getAllOrdersAdmin);
router.patch('/admin/:id/status', authenticate, requireAdmin, updateOrderStatusAdmin);

export default router;
