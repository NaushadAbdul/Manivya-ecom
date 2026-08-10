import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface IOrderStatusHistory {
  status: string;
  note?: string;
  updatedBy?: string;
  timestamp: Date;
}

export interface IOrder extends Document {
  orderNumber: string;
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: {
    name: string;
    phone: string;
    fullAddress: string;
    area: string;
    city: string;
    state: string;
    postalCode: string;
    latitude?: number;
    longitude?: number;
  };
  paymentMethod: 'cod' | 'qr_code';
  paymentInfo: {
    status: 'Pending' | 'Verified' | 'Rejected' | 'Paid';
    transactionId?: string;
    proofImage?: string;
    rejectionReason?: string;
  };
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  orderStatus:
    | 'Confirmed'
    | 'Preparing'
    | 'Packed'
    | 'Assigned'
    | 'Shipped'
    | 'Out for Delivery'
    | 'Delivered'
    | 'Cancelled'
    | 'Returned'
    | 'Refunded';
  trackingNumber: string;
  deliveryPartner: string; // Partner Name or Courier Brand
  assignedWarehouse?: mongoose.Types.ObjectId;
  assignedPartner?: mongoose.Types.ObjectId;
  courierName?: string;
  dispatchDate?: Date;
  cancellationReason?: string;
  cancelledAt?: Date;
  cancelledBy?: string;
  estimatedDeliveryDate: Date;
  statusHistory: IOrderStatusHistory[];
  liveLocation?: {
    latitude: number;
    longitude: number;
    updatedAt: Date;
  };
}

const OrderSchema: Schema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    shippingAddress: {
      name: { type: String, required: true, default: 'Valued Customer' },
      phone: { type: String, required: true, default: '+91 98765 43210' },
      fullAddress: { type: String, required: true, default: 'Express Delivery Address' },
      area: { type: String, required: true, default: 'Gajuwaka' },
      city: { type: String, required: true, default: 'Visakhapatnam' },
      state: { type: String, required: true, default: 'Andhra Pradesh' },
      postalCode: { type: String, required: true, default: '530026' },
      latitude: { type: Number },
      longitude: { type: Number },
    },
    paymentMethod: { type: String, enum: ['cod', 'qr_code'], required: true },
    paymentInfo: {
      status: { type: String, enum: ['Pending', 'Verified', 'Rejected', 'Paid'], default: 'Pending' },
      transactionId: { type: String, default: '' },
      proofImage: { type: String, default: '' },
      rejectionReason: { type: String, default: '' },
    },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    orderStatus: {
      type: String,
      enum: [
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
      ],
      default: 'Confirmed',
      index: true,
    },
    trackingNumber: { type: String, required: true },
    deliveryPartner: { type: String, default: 'MANIVYA Express Logistics' },
    assignedWarehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse' },
    assignedPartner: { type: Schema.Types.ObjectId, ref: 'DeliveryPartner' },
    courierName: { type: String, default: 'Internal Express Delivery' },
    dispatchDate: { type: Date },
    cancellationReason: { type: String, default: '' },
    cancelledAt: { type: Date },
    cancelledBy: { type: String, default: '' },
    estimatedDeliveryDate: { type: Date, required: true },
    statusHistory: [
      {
        status: { type: String, required: true },
        note: { type: String, default: '' },
        updatedBy: { type: String, default: 'System' },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    liveLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
      updatedAt: { type: Date },
    },
  },
  { timestamps: true }
);

// Compound indexes for analytics aggregation performance
OrderSchema.index({ orderStatus: 1, createdAt: -1 });
OrderSchema.index({ 'paymentInfo.status': 1, createdAt: -1 });
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ createdAt: -1 });

export default mongoose.model<IOrder>('Order', OrderSchema);

