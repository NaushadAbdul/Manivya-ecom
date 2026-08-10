import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Warehouse from '../models/Warehouse';
import DeliveryPartner from '../models/DeliveryPartner';
import Order from '../models/Order';
import { LogisticsManager } from '../services/logisticsService';
import { sendSuccess, sendError } from '../utils/apiResponse';

// Warehouse Handlers
export const getWarehouses = async (_req: Request, res: Response) => {
  try {
    const warehouses = await Warehouse.find().sort({ createdAt: -1 });
    return sendSuccess(res, warehouses, 'Warehouses fetched successfully');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const createWarehouse = async (req: Request, res: Response) => {
  try {
    const { name, code, fullAddress, area, city, state, country, postalCode, latitude, longitude, managerName, managerPhone, supportedRadiusKm } = req.body;
    const warehouse = await Warehouse.create({
      name,
      code: code.toUpperCase(),
      fullAddress,
      area,
      city,
      state,
      country: country || 'India',
      postalCode,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      managerName,
      managerPhone,
      supportedRadiusKm: parseFloat(supportedRadiusKm) || 500,
    });

    return sendSuccess(res, warehouse, 'Warehouse created successfully', 201);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const deleteWarehouse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Warehouse.findByIdAndDelete(id);
    return sendSuccess(res, null, 'Warehouse deleted');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

// Delivery Partner Handlers
export const getDeliveryPartners = async (_req: Request, res: Response) => {
  try {
    const partners = await DeliveryPartner.find().sort({ createdAt: -1 });
    return sendSuccess(res, partners, 'Delivery partners fetched');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const createDeliveryPartner = async (req: Request, res: Response) => {
  try {
    const { name, phone, vehicleType, providerType, rating } = req.body;
    const partnerId = `DP-${Math.floor(1000 + Math.random() * 9000)}`;

    const partner = await DeliveryPartner.create({
      partnerId,
      name,
      phone,
      vehicleType: vehicleType || 'Van',
      providerType: providerType || 'Internal',
      rating: parseFloat(rating) || 4.8,
    });

    return sendSuccess(res, partner, 'Delivery partner registered successfully', 201);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const deleteDeliveryPartner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await DeliveryPartner.findByIdAndDelete(id);
    return sendSuccess(res, null, 'Delivery partner removed');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

// Order Assignment & Status Workflow
export const assignWarehouseToOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { warehouseId } = req.body;

    let warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse) return sendError(res, 'Warehouse not found', 404);

    const order = await Order.findByIdAndUpdate(
      orderId,
      { assignedWarehouse: warehouse._id },
      { new: true }
    ).populate('assignedWarehouse');

    if (!order) return sendError(res, 'Order not found', 404);

    return sendSuccess(res, order, `Order assigned to warehouse ${warehouse.name}`);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const assignPartnerToOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { partnerId } = req.body;

    const partner = await DeliveryPartner.findById(partnerId);
    if (!partner) return sendError(res, 'Delivery Partner not found', 404);

    const order = await Order.findById(orderId);
    if (!order) return sendError(res, 'Order not found', 404);

    order.assignedPartner = partner._id;
    order.courierName = `${partner.name} (${partner.providerType})`;
    order.deliveryPartner = partner.name;
    order.orderStatus = 'Assigned';
    order.statusHistory.push({
      status: 'Assigned',
      note: `Assigned to delivery partner ${partner.name} (${partner.phone})`,
      updatedBy: req.user?.name || 'Admin',
      timestamp: new Date(),
    });

    partner.assignedOrdersCount += 1;
    partner.availability = 'On Delivery';
    await partner.save();
    await order.save();

    return sendSuccess(res, order, `Order assigned to partner ${partner.name}`);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const updateDeliveryStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status, note } = req.body;

    const validStatuses = [
      'Confirmed',
      'Preparing',
      'Packed',
      'Assigned',
      'Shipped',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
      'Returned',
      'Refunded',
    ];

    if (!validStatuses.includes(status)) {
      return sendError(res, 'Invalid delivery status provided', 400);
    }

    const provider = LogisticsManager.getProvider();
    const updatedOrder = await provider.updateStatus(orderId, status, note, req.user?.name || 'Admin');

    return sendSuccess(res, updatedOrder, `Delivery status updated to ${status}`);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const getTrackingDetails = async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    const provider = LogisticsManager.getProvider();
    const trackingInfo = await provider.getTracking(identifier);

    if (!trackingInfo) {
      return sendError(res, 'Tracking record not found', 404);
    }

    return sendSuccess(res, trackingInfo, 'Logistics tracking info retrieved');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};
