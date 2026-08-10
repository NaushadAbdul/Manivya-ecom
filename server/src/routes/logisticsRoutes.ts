import { Router } from 'express';
import {
  getWarehouses,
  createWarehouse,
  deleteWarehouse,
  getDeliveryPartners,
  createDeliveryPartner,
  deleteDeliveryPartner,
  assignWarehouseToOrder,
  assignPartnerToOrder,
  updateDeliveryStatus,
  getTrackingDetails,
} from '../controllers/logisticsController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Public Tracking Route
router.get('/track/:identifier', getTrackingDetails);

// Admin Logistics Routes
router.get('/warehouses', authenticate, requireAdmin, getWarehouses);
router.post('/warehouses', authenticate, requireAdmin, createWarehouse);
router.delete('/warehouses/:id', authenticate, requireAdmin, deleteWarehouse);

router.get('/partners', authenticate, requireAdmin, getDeliveryPartners);
router.post('/partners', authenticate, requireAdmin, createDeliveryPartner);
router.delete('/partners/:id', authenticate, requireAdmin, deleteDeliveryPartner);

router.post('/orders/:orderId/assign-warehouse', authenticate, requireAdmin, assignWarehouseToOrder);
router.post('/orders/:orderId/assign-partner', authenticate, requireAdmin, assignPartnerToOrder);
router.patch('/orders/:orderId/status', authenticate, requireAdmin, updateDeliveryStatus);

export default router;
