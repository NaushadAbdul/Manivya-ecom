"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrder = exports.updateOrderStatusAdmin = exports.getAllOrdersAdmin = exports.getOrderById = exports.getMyOrders = exports.createOrder = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Order_1 = __importDefault(require("../models/Order"));
const Payment_1 = __importDefault(require("../models/Payment"));
const Product_1 = __importDefault(require("../models/Product"));
const apiResponse_1 = require("../utils/apiResponse");
const locationService_1 = require("../services/locationService");
const notificationService_1 = require("../services/notificationService");
const logisticsService_1 = require("../services/logisticsService");
const emailService_1 = require("../services/emailService");
const whatsappService_1 = require("../services/whatsappService");
const createOrder = async (req, res) => {
    try {
        if (!req.user)
            return (0, apiResponse_1.sendError)(res, 'Unauthorized', 401);
        const { items, shippingAddress, paymentMethod, discountAmount = 0 } = req.body;
        if (!items || items.length === 0) {
            return (0, apiResponse_1.sendError)(res, 'Order must contain at least one item', 400);
        }
        let subtotal = 0;
        const processedItems = [];
        for (const item of items) {
            let product = null;
            if (item.product && mongoose_1.default.Types.ObjectId.isValid(item.product)) {
                product = await Product_1.default.findById(item.product);
            }
            if (!product && item.slug) {
                product = await Product_1.default.findOne({ slug: item.slug });
            }
            if (!product && item.name) {
                product = await Product_1.default.findOne({ name: item.name });
            }
            if (!product) {
                product = await Product_1.default.findOne();
            }
            if (!product) {
                return (0, apiResponse_1.sendError)(res, `No products available in catalog.`, 404);
            }
            const price = product.sellingPrice;
            subtotal += price * item.quantity;
            // Deduct stock
            if (product.stock > 0) {
                product.stock = Math.max(0, product.stock - item.quantity);
                if (product.stock === 0)
                    product.availability = 'out_of_stock';
                await product.save();
            }
            processedItems.push({
                product: product._id,
                name: product.name,
                image: (product.images && product.images[0]) || '',
                price,
                quantity: item.quantity,
            });
        }
        // Dynamic Shipping calculation based on user address latitude/longitude
        const deliveryInfo = locationService_1.LocationService.calculateDeliveryInfo(shippingAddress.latitude, shippingAddress.longitude, subtotal);
        const shippingFee = deliveryInfo.shippingFee;
        const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount);
        const orderNumber = `MNV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
        const trackingNumber = `TRK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        const estimatedDelivery = new Date();
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);
        // Auto-assign nearest warehouse & available delivery partner
        const nearestWarehouse = await logisticsService_1.LogisticsManager.autoAssignNearestWarehouse(shippingAddress.latitude, shippingAddress.longitude);
        const assignedPartner = await logisticsService_1.LogisticsManager.autoAssignDeliveryPartner();
        const sanitizedAddress = {
            name: (shippingAddress && shippingAddress.name) || req.user.name || 'Valued Customer',
            phone: (shippingAddress && shippingAddress.phone && shippingAddress.phone.trim() !== '')
                ? shippingAddress.phone
                : (req.user.phone && req.user.phone.trim() !== '' ? req.user.phone : '+91 98765 43210'),
            fullAddress: (shippingAddress && shippingAddress.fullAddress) || 'Express Delivery Location',
            area: (shippingAddress && shippingAddress.area) || 'Gajuwaka',
            city: (shippingAddress && shippingAddress.city) || 'Visakhapatnam',
            state: (shippingAddress && shippingAddress.state) || 'Andhra Pradesh',
            postalCode: (shippingAddress && shippingAddress.postalCode) || '530026',
            latitude: (shippingAddress && shippingAddress.latitude) || 17.6868,
            longitude: (shippingAddress && shippingAddress.longitude) || 83.2185,
        };
        const order = await Order_1.default.create({
            orderNumber,
            user: req.user._id,
            items: processedItems,
            shippingAddress: sanitizedAddress,
            paymentMethod,
            paymentInfo: {
                status: paymentMethod === 'cod' ? 'Pending' : 'Pending',
            },
            subtotal,
            shippingFee,
            discountAmount,
            totalAmount,
            orderStatus: 'Confirmed',
            trackingNumber,
            deliveryPartner: assignedPartner ? assignedPartner.name : 'MANIVYA Express Logistics',
            assignedWarehouse: nearestWarehouse ? nearestWarehouse._id : undefined,
            assignedPartner: assignedPartner ? assignedPartner._id : undefined,
            courierName: assignedPartner ? `${assignedPartner.name} (${assignedPartner.providerType})` : 'MANIVYA Express Logistics',
            estimatedDeliveryDate: estimatedDelivery,
            statusHistory: [
                {
                    status: 'Confirmed',
                    note: nearestWarehouse
                        ? `Order confirmed and assigned to ${nearestWarehouse.name} (${nearestWarehouse.city})`
                        : 'Order placed successfully and confirmed.',
                    updatedBy: 'System',
                    timestamp: new Date(),
                },
            ],
            liveLocation: shippingAddress.latitude && shippingAddress.longitude ? {
                latitude: shippingAddress.latitude + 0.05,
                longitude: shippingAddress.longitude + 0.05,
                updatedAt: new Date(),
            } : undefined,
        });
        // Create payment record if QR code payment
        if (paymentMethod === 'qr_code') {
            await Payment_1.default.create({
                order: order._id,
                user: req.user._id,
                paymentMethod: 'qr_code',
                amount: totalAmount,
                status: 'Pending',
            });
        }
        // Dispatch in-app notification
        await notificationService_1.NotificationService.sendNotification(req.user._id.toString(), `Order Confirmed (${order.orderNumber})`, `Your order worth ₹${totalAmount} has been placed. Tracking Number: ${trackingNumber}`, 'order', `/orders/${order._id}`);
        // Fire email + WhatsApp confirmations (non-blocking — failures don't affect order response)
        const emailData = {
            customerName: req.user.name || sanitizedAddress.name,
            customerEmail: req.user.email || '',
            orderNumber,
            trackingNumber,
            totalAmount,
            items: processedItems.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
            shippingAddress: {
                fullAddress: sanitizedAddress.fullAddress,
                city: sanitizedAddress.city,
                state: sanitizedAddress.state,
                postalCode: sanitizedAddress.postalCode,
            },
            estimatedDelivery,
            paymentMethod,
        };
        const whatsappData = {
            customerName: req.user.name || sanitizedAddress.name,
            customerPhone: sanitizedAddress.phone || req.user.phone || '',
            orderNumber,
            trackingNumber,
            totalAmount,
            itemCount: processedItems.length,
            estimatedDelivery,
            paymentMethod,
        };
        // Send both concurrently without awaiting — order response returns immediately
        Promise.all([
            emailData.customerEmail ? (0, emailService_1.sendOrderConfirmationEmail)(emailData) : Promise.resolve(),
            whatsappData.customerPhone ? (0, whatsappService_1.sendOrderWhatsApp)(whatsappData) : Promise.resolve(),
        ]).catch(err => console.error('Notification dispatch error:', err));
        return (0, apiResponse_1.sendSuccess)(res, order, 'Order created successfully', 201);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.createOrder = createOrder;
const getMyOrders = async (req, res) => {
    try {
        if (!req.user)
            return (0, apiResponse_1.sendError)(res, 'Unauthorized', 401);
        const orders = await Order_1.default.find({ user: req.user._id }).sort({ createdAt: -1 });
        return (0, apiResponse_1.sendSuccess)(res, orders, 'Orders retrieved successfully');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getMyOrders = getMyOrders;
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order_1.default.findById(id).populate('user', 'name email phone');
        if (!order)
            return (0, apiResponse_1.sendError)(res, 'Order not found', 404);
        return (0, apiResponse_1.sendSuccess)(res, order, 'Order details retrieved');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getOrderById = getOrderById;
const getAllOrdersAdmin = async (req, res) => {
    try {
        const { status, search } = req.query;
        const query = {};
        if (status)
            query.orderStatus = status;
        if (search)
            query.orderNumber = { $regex: search, $options: 'i' };
        const orders = await Order_1.default.find(query)
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 });
        return (0, apiResponse_1.sendSuccess)(res, orders, 'All orders fetched for admin');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getAllOrdersAdmin = getAllOrdersAdmin;
const updateOrderStatusAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, note } = req.body;
        const validStatuses = ['Confirmed', 'Preparing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return (0, apiResponse_1.sendError)(res, 'Invalid order status', 400);
        }
        const order = await Order_1.default.findById(id);
        if (!order)
            return (0, apiResponse_1.sendError)(res, 'Order not found', 404);
        order.orderStatus = status;
        order.statusHistory.push({
            status,
            note: note || `Status updated to ${status} by admin.`,
            timestamp: new Date(),
        });
        if (status === 'Delivered' && order.paymentMethod === 'cod') {
            order.paymentInfo.status = 'Paid';
        }
        await order.save();
        // Send real-time notification
        await notificationService_1.NotificationService.sendNotification(order.user.toString(), `Order Status Update: ${status}`, `Your order #${order.orderNumber} status is now "${status}".`, 'order', `/orders/${order._id}`);
        return (0, apiResponse_1.sendSuccess)(res, order, `Order status updated to ${status}`);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.updateOrderStatusAdmin = updateOrderStatusAdmin;
const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const order = await Order_1.default.findById(id);
        if (!order)
            return (0, apiResponse_1.sendError)(res, 'Order not found', 404);
        if (order.orderStatus === 'Cancelled') {
            return (0, apiResponse_1.sendError)(res, 'Order is already cancelled', 400);
        }
        if (['Shipped', 'Out for Delivery', 'Delivered'].includes(order.orderStatus)) {
            return (0, apiResponse_1.sendError)(res, `Cannot cancel order that is already ${order.orderStatus}`, 400);
        }
        order.orderStatus = 'Cancelled';
        order.cancellationReason = reason || 'Customer requested cancellation.';
        order.cancelledAt = new Date();
        order.cancelledBy = req.user?.name || 'Customer';
        order.statusHistory.push({
            status: 'Cancelled',
            note: `Order cancelled. Reason: ${order.cancellationReason}`,
            updatedBy: req.user?.name || 'User',
            timestamp: new Date(),
        });
        // Automatically Restore Product Inventory Stock
        for (const item of order.items) {
            const product = await Product_1.default.findById(item.product);
            if (product) {
                product.stock += item.quantity;
                if (product.stock > 0)
                    product.availability = 'in_stock';
                await product.save();
            }
        }
        await order.save();
        await notificationService_1.NotificationService.sendNotification(order.user.toString(), `Order Cancelled (${order.orderNumber})`, `Your order #${order.orderNumber} has been cancelled and product stock restored.`, 'order', `/orders/${order._id}`);
        return (0, apiResponse_1.sendSuccess)(res, order, 'Order cancelled successfully and stock restored');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.cancelOrder = cancelOrder;
