"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrackingDetails = exports.updateDeliveryStatus = exports.assignPartnerToOrder = exports.assignWarehouseToOrder = exports.deleteDeliveryPartner = exports.createDeliveryPartner = exports.getDeliveryPartners = exports.deleteWarehouse = exports.createWarehouse = exports.getWarehouses = void 0;
const Warehouse_1 = __importDefault(require("../models/Warehouse"));
const DeliveryPartner_1 = __importDefault(require("../models/DeliveryPartner"));
const Order_1 = __importDefault(require("../models/Order"));
const logisticsService_1 = require("../services/logisticsService");
const apiResponse_1 = require("../utils/apiResponse");
// Warehouse Handlers
const getWarehouses = async (_req, res) => {
    try {
        const warehouses = await Warehouse_1.default.find().sort({ createdAt: -1 });
        return (0, apiResponse_1.sendSuccess)(res, warehouses, 'Warehouses fetched successfully');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getWarehouses = getWarehouses;
const createWarehouse = async (req, res) => {
    try {
        const { name, code, fullAddress, area, city, state, country, postalCode, latitude, longitude, managerName, managerPhone, supportedRadiusKm } = req.body;
        const warehouse = await Warehouse_1.default.create({
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
        return (0, apiResponse_1.sendSuccess)(res, warehouse, 'Warehouse created successfully', 201);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.createWarehouse = createWarehouse;
const deleteWarehouse = async (req, res) => {
    try {
        const { id } = req.params;
        await Warehouse_1.default.findByIdAndDelete(id);
        return (0, apiResponse_1.sendSuccess)(res, null, 'Warehouse deleted');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.deleteWarehouse = deleteWarehouse;
// Delivery Partner Handlers
const getDeliveryPartners = async (_req, res) => {
    try {
        const partners = await DeliveryPartner_1.default.find().sort({ createdAt: -1 });
        return (0, apiResponse_1.sendSuccess)(res, partners, 'Delivery partners fetched');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getDeliveryPartners = getDeliveryPartners;
const createDeliveryPartner = async (req, res) => {
    try {
        const { name, phone, vehicleType, providerType, rating } = req.body;
        const partnerId = `DP-${Math.floor(1000 + Math.random() * 9000)}`;
        const partner = await DeliveryPartner_1.default.create({
            partnerId,
            name,
            phone,
            vehicleType: vehicleType || 'Van',
            providerType: providerType || 'Internal',
            rating: parseFloat(rating) || 4.8,
        });
        return (0, apiResponse_1.sendSuccess)(res, partner, 'Delivery partner registered successfully', 201);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.createDeliveryPartner = createDeliveryPartner;
const deleteDeliveryPartner = async (req, res) => {
    try {
        const { id } = req.params;
        await DeliveryPartner_1.default.findByIdAndDelete(id);
        return (0, apiResponse_1.sendSuccess)(res, null, 'Delivery partner removed');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.deleteDeliveryPartner = deleteDeliveryPartner;
// Order Assignment & Status Workflow
const assignWarehouseToOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { warehouseId } = req.body;
        let warehouse = await Warehouse_1.default.findById(warehouseId);
        if (!warehouse)
            return (0, apiResponse_1.sendError)(res, 'Warehouse not found', 404);
        const order = await Order_1.default.findByIdAndUpdate(orderId, { assignedWarehouse: warehouse._id }, { new: true }).populate('assignedWarehouse');
        if (!order)
            return (0, apiResponse_1.sendError)(res, 'Order not found', 404);
        return (0, apiResponse_1.sendSuccess)(res, order, `Order assigned to warehouse ${warehouse.name}`);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.assignWarehouseToOrder = assignWarehouseToOrder;
const assignPartnerToOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { partnerId } = req.body;
        const partner = await DeliveryPartner_1.default.findById(partnerId);
        if (!partner)
            return (0, apiResponse_1.sendError)(res, 'Delivery Partner not found', 404);
        const order = await Order_1.default.findById(orderId);
        if (!order)
            return (0, apiResponse_1.sendError)(res, 'Order not found', 404);
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
        return (0, apiResponse_1.sendSuccess)(res, order, `Order assigned to partner ${partner.name}`);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.assignPartnerToOrder = assignPartnerToOrder;
const updateDeliveryStatus = async (req, res) => {
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
            return (0, apiResponse_1.sendError)(res, 'Invalid delivery status provided', 400);
        }
        const provider = logisticsService_1.LogisticsManager.getProvider();
        const updatedOrder = await provider.updateStatus(orderId, status, note, req.user?.name || 'Admin');
        return (0, apiResponse_1.sendSuccess)(res, updatedOrder, `Delivery status updated to ${status}`);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.updateDeliveryStatus = updateDeliveryStatus;
const getTrackingDetails = async (req, res) => {
    try {
        const { identifier } = req.params;
        const provider = logisticsService_1.LogisticsManager.getProvider();
        const trackingInfo = await provider.getTracking(identifier);
        if (!trackingInfo) {
            return (0, apiResponse_1.sendError)(res, 'Tracking record not found', 404);
        }
        return (0, apiResponse_1.sendSuccess)(res, trackingInfo, 'Logistics tracking info retrieved');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getTrackingDetails = getTrackingDetails;
