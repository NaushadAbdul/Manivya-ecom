"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogisticsManager = exports.InternalLogisticsProvider = void 0;
const Warehouse_1 = __importDefault(require("../models/Warehouse"));
const DeliveryPartner_1 = __importDefault(require("../models/DeliveryPartner"));
const Order_1 = __importDefault(require("../models/Order"));
const notificationService_1 = require("./notificationService");
/**
 * Production Internal Provider Engine.
 * Supports immediate order updates and is structured for future Shiprocket, Delhivery, BlueDart plug-ins.
 */
class InternalLogisticsProvider {
    name = 'Internal Logistics Engine';
    async createShipment(order) {
        const trackingNumber = `TRK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        return {
            trackingNumber,
            courierName: 'MANIVYA Express Logistics',
        };
    }
    async updateStatus(orderId, newStatus, note = '', updatedBy = 'Admin') {
        const order = await Order_1.default.findById(orderId).populate('assignedWarehouse assignedPartner user');
        if (!order)
            throw new Error('Order not found');
        order.orderStatus = newStatus;
        order.statusHistory.push({
            status: newStatus,
            note: note || `Order status transitioned to ${newStatus}`,
            updatedBy,
            timestamp: new Date(),
        });
        if (newStatus === 'Shipped') {
            order.dispatchDate = new Date();
        }
        if (newStatus === 'Delivered' && order.paymentMethod === 'cod') {
            order.paymentInfo.status = 'Paid';
        }
        await order.save();
        // Trigger Notification
        await notificationService_1.NotificationService.sendNotification(order.user._id ? order.user._id.toString() : order.user.toString(), `Order ${newStatus}`, `Order #${order.orderNumber} is now ${newStatus}. ${note}`, 'order', `/orders/${order._id}`);
        return order;
    }
    async getTracking(identifier) {
        const isObjectId = identifier.match(/^[0-9a-fA-F]{24}$/);
        const query = isObjectId ? { _id: identifier } : { trackingNumber: identifier };
        const order = await Order_1.default.findOne(query)
            .populate('assignedWarehouse')
            .populate('assignedPartner')
            .populate('user', 'name email phone');
        if (!order)
            return null;
        return {
            orderNumber: order.orderNumber,
            trackingNumber: order.trackingNumber,
            orderStatus: order.orderStatus,
            courierName: order.courierName || order.deliveryPartner,
            dispatchDate: order.dispatchDate,
            estimatedDeliveryDate: order.estimatedDeliveryDate,
            shippingAddress: order.shippingAddress,
            warehouse: order.assignedWarehouse,
            deliveryPartner: order.assignedPartner,
            statusHistory: order.statusHistory,
            items: order.items,
            totalAmount: order.totalAmount,
            liveLocation: order.liveLocation,
        };
    }
}
exports.InternalLogisticsProvider = InternalLogisticsProvider;
class LogisticsManager {
    static internalProvider = new InternalLogisticsProvider();
    /**
     * Auto-assigns the nearest active warehouse using Haversine calculation
     */
    static async autoAssignNearestWarehouse(latitude, longitude) {
        const warehouses = await Warehouse_1.default.find({ isActive: true });
        if (warehouses.length === 0)
            return null;
        if (!latitude || !longitude) {
            return warehouses[0]; // Default to first available warehouse
        }
        let nearest = null;
        let minDistance = Infinity;
        for (const w of warehouses) {
            const dist = LogisticsManager.haversineDistance(latitude, longitude, w.latitude, w.longitude);
            if (dist < minDistance) {
                minDistance = dist;
                nearest = w;
            }
        }
        return nearest || warehouses[0];
    }
    /**
     * Auto-assigns an available delivery partner
     */
    static async autoAssignDeliveryPartner() {
        const partner = await DeliveryPartner_1.default.findOne({ isActive: true, availability: 'Available' });
        return partner;
    }
    static getProvider(_providerType = 'Internal') {
        // Extensible factory method for Shiprocket, Delhivery, BlueDart, DTDC, IndiaPost, AmazonShipping
        return LogisticsManager.internalProvider;
    }
    static haversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
exports.LogisticsManager = LogisticsManager;
