"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyticsController_1 = require("../controllers/analyticsController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// All analytics routes are admin-protected
router.get('/dashboard', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, analyticsController_1.getDashboardSummary);
router.get('/monthly-revenue', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, analyticsController_1.getMonthlyRevenue);
router.get('/revenue', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, analyticsController_1.getRevenueAnalytics);
router.get('/orders', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, analyticsController_1.getOrderAnalytics);
router.get('/customers', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, analyticsController_1.getCustomerAnalytics);
router.get('/products', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, analyticsController_1.getProductAnalytics);
router.get('/categories', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, analyticsController_1.getCategoryAnalytics);
router.get('/inventory', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, analyticsController_1.getInventoryAnalytics);
router.get('/payments', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, analyticsController_1.getPaymentAnalytics);
exports.default = router;
