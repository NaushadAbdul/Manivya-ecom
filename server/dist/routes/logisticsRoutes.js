"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logisticsController_1 = require("../controllers/logisticsController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public Tracking Route
router.get('/track/:identifier', logisticsController_1.getTrackingDetails);
// Admin Logistics Routes
router.get('/warehouses', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, logisticsController_1.getWarehouses);
router.post('/warehouses', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, logisticsController_1.createWarehouse);
router.delete('/warehouses/:id', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, logisticsController_1.deleteWarehouse);
router.get('/partners', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, logisticsController_1.getDeliveryPartners);
router.post('/partners', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, logisticsController_1.createDeliveryPartner);
router.delete('/partners/:id', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, logisticsController_1.deleteDeliveryPartner);
router.post('/orders/:orderId/assign-warehouse', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, logisticsController_1.assignWarehouseToOrder);
router.post('/orders/:orderId/assign-partner', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, logisticsController_1.assignPartnerToOrder);
router.patch('/orders/:orderId/status', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, logisticsController_1.updateDeliveryStatus);
exports.default = router;
