import { Router } from 'express';
import {
  getDashboardSummary,
  getMonthlyRevenue,
  getRevenueAnalytics,
  getOrderAnalytics,
  getCustomerAnalytics,
  getProductAnalytics,
  getCategoryAnalytics,
  getInventoryAnalytics,
  getPaymentAnalytics,
} from '../controllers/analyticsController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// All analytics routes are admin-protected
router.get('/dashboard', authenticate, requireAdmin, getDashboardSummary);
router.get('/monthly-revenue', authenticate, requireAdmin, getMonthlyRevenue);
router.get('/revenue', authenticate, requireAdmin, getRevenueAnalytics);
router.get('/orders', authenticate, requireAdmin, getOrderAnalytics);
router.get('/customers', authenticate, requireAdmin, getCustomerAnalytics);
router.get('/products', authenticate, requireAdmin, getProductAnalytics);
router.get('/categories', authenticate, requireAdmin, getCategoryAnalytics);
router.get('/inventory', authenticate, requireAdmin, getInventoryAnalytics);
router.get('/payments', authenticate, requireAdmin, getPaymentAnalytics);

export default router;
