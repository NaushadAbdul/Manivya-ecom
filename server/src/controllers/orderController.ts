import mongoose from 'mongoose';
import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Order from '../models/Order';
import Payment from '../models/Payment';
import Product from '../models/Product';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { LocationService } from '../services/locationService';
import { NotificationService } from '../services/notificationService';
import { LogisticsManager } from '../services/logisticsService';
import { sendOrderConfirmationEmail } from '../services/emailService';
import { sendOrderWhatsApp } from '../services/whatsappService';

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const { items, shippingAddress, paymentMethod, discountAmount = 0 } = req.body;

    if (!items || items.length === 0) {
      return sendError(res, 'Order must contain at least one item', 400);
    }

    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      let product = null;

      if (item.product && mongoose.Types.ObjectId.isValid(item.product)) {
        product = await Product.findById(item.product);
      }
      if (!product && item.slug) {
        product = await Product.findOne({ slug: item.slug });
      }
      if (!product && item.name) {
        product = await Product.findOne({ name: item.name });
      }
      if (!product) {
        product = await Product.findOne();
      }
      if (!product) {
        return sendError(res, `No products available in catalog.`, 404);
      }

      const price = product.sellingPrice;
      subtotal += price * item.quantity;

      // Deduct stock
      if (product.stock > 0) {
        product.stock = Math.max(0, product.stock - item.quantity);
        if (product.stock === 0) product.availability = 'out_of_stock';
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
    const deliveryInfo = LocationService.calculateDeliveryInfo(
      shippingAddress.latitude,
      shippingAddress.longitude,
      subtotal
    );

    const shippingFee = deliveryInfo.shippingFee;
    const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount);

    const orderNumber = `MNV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const trackingNumber = `TRK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);

    // Auto-assign nearest warehouse & available delivery partner
    const nearestWarehouse = await LogisticsManager.autoAssignNearestWarehouse(
      shippingAddress.latitude,
      shippingAddress.longitude
    );
    const assignedPartner = await LogisticsManager.autoAssignDeliveryPartner();

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

    const order = await Order.create({
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
      await Payment.create({
        order: order._id,
        user: req.user._id,
        paymentMethod: 'qr_code',
        amount: totalAmount,
        status: 'Pending',
      });
    }

    // Dispatch in-app notification
    await NotificationService.sendNotification(
      req.user._id.toString(),
      `Order Confirmed (${order.orderNumber})`,
      `Your order worth ₹${totalAmount} has been placed. Tracking Number: ${trackingNumber}`,
      'order',
      `/orders/${order._id}`
    );

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
      emailData.customerEmail ? sendOrderConfirmationEmail(emailData) : Promise.resolve(),
      whatsappData.customerPhone ? sendOrderWhatsApp(whatsappData) : Promise.resolve(),
    ]).catch(err => console.error('Notification dispatch error:', err));

    return sendSuccess(res, order, 'Order created successfully', 201);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return sendSuccess(res, orders, 'Orders retrieved successfully');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate('user', 'name email phone');

    if (!order) return sendError(res, 'Order not found', 404);

    return sendSuccess(res, order, 'Order details retrieved');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const getAllOrdersAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { status, search } = req.query;
    const query: any = {};

    if (status) query.orderStatus = status;
    if (search) query.orderNumber = { $regex: search as string, $options: 'i' };

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    return sendSuccess(res, orders, 'All orders fetched for admin');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const updateOrderStatusAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses = ['Confirmed', 'Preparing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return sendError(res, 'Invalid order status', 400);
    }

    const order = await Order.findById(id);
    if (!order) return sendError(res, 'Order not found', 404);

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
    await NotificationService.sendNotification(
      order.user.toString(),
      `Order Status Update: ${status}`,
      `Your order #${order.orderNumber} status is now "${status}".`,
      'order',
      `/orders/${order._id}`
    );

    return sendSuccess(res, order, `Order status updated to ${status}`);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(id);
    if (!order) return sendError(res, 'Order not found', 404);

    if (order.orderStatus === 'Cancelled') {
      return sendError(res, 'Order is already cancelled', 400);
    }

    if (['Shipped', 'Out for Delivery', 'Delivered'].includes(order.orderStatus)) {
      return sendError(res, `Cannot cancel order that is already ${order.orderStatus}`, 400);
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
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        if (product.stock > 0) product.availability = 'in_stock';
        await product.save();
      }
    }

    await order.save();

    await NotificationService.sendNotification(
      order.user.toString(),
      `Order Cancelled (${order.orderNumber})`,
      `Your order #${order.orderNumber} has been cancelled and product stock restored.`,
      'order',
      `/orders/${order._id}`
    );

    return sendSuccess(res, order, 'Order cancelled successfully and stock restored');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};
