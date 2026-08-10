import Warehouse, { IWarehouse } from '../models/Warehouse';
import DeliveryPartner, { IDeliveryPartner } from '../models/DeliveryPartner';
import Order, { IOrder } from '../models/Order';
import { NotificationService } from './notificationService';

export interface ILogisticsProvider {
  name: string;
  createShipment(order: IOrder): Promise<{ trackingNumber: string; courierName: string }>;
  updateStatus(orderId: string, newStatus: string, note?: string, updatedBy?: string): Promise<IOrder>;
  getTracking(identifier: string): Promise<any>;
}

/**
 * Production Internal Provider Engine.
 * Supports immediate order updates and is structured for future Shiprocket, Delhivery, BlueDart plug-ins.
 */
export class InternalLogisticsProvider implements ILogisticsProvider {
  name = 'Internal Logistics Engine';

  async createShipment(order: IOrder) {
    const trackingNumber = `TRK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    return {
      trackingNumber,
      courierName: 'MANIVYA Express Logistics',
    };
  }

  async updateStatus(orderId: string, newStatus: any, note: string = '', updatedBy: string = 'Admin'): Promise<IOrder> {
    const order = await Order.findById(orderId).populate('assignedWarehouse assignedPartner user');
    if (!order) throw new Error('Order not found');

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
    await NotificationService.sendNotification(
      order.user._id ? order.user._id.toString() : order.user.toString(),
      `Order ${newStatus}`,
      `Order #${order.orderNumber} is now ${newStatus}. ${note}`,
      'order',
      `/orders/${order._id}`
    );

    return order;
  }

  async getTracking(identifier: string) {
    const isObjectId = identifier.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: identifier } : { trackingNumber: identifier };

    const order = await Order.findOne(query)
      .populate('assignedWarehouse')
      .populate('assignedPartner')
      .populate('user', 'name email phone');

    if (!order) return null;

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

export class LogisticsManager {
  private static internalProvider = new InternalLogisticsProvider();

  /**
   * Auto-assigns the nearest active warehouse using Haversine calculation
   */
  static async autoAssignNearestWarehouse(latitude?: number, longitude?: number): Promise<IWarehouse | null> {
    const warehouses = await Warehouse.find({ isActive: true });
    if (warehouses.length === 0) return null;

    if (!latitude || !longitude) {
      return warehouses[0]; // Default to first available warehouse
    }

    let nearest: IWarehouse | null = null;
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
  static async autoAssignDeliveryPartner(): Promise<IDeliveryPartner | null> {
    const partner = await DeliveryPartner.findOne({ isActive: true, availability: 'Available' });
    return partner;
  }

  static getProvider(_providerType: string = 'Internal'): ILogisticsProvider {
    // Extensible factory method for Shiprocket, Delhivery, BlueDart, DTDC, IndiaPost, AmazonShipping
    return LogisticsManager.internalProvider;
  }

  public static haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
