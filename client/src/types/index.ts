export interface User {
  _id: string;
  uid: string;
  name: string;
  email: string;
  phone?: string;
  photo?: string;
  provider: string;
  role: 'customer' | 'admin';
  status?: 'active' | 'blocked';
  blockedReason?: string;
  createdAt: string;
  lastLogin: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  introVideo?: string;
  isActive: boolean;
}

export interface SiteTheme {
  _id?: string;
  bgType: 'gradient' | 'image' | 'color';
  navbarBgType: 'gradient' | 'image' | 'color';
  bgColor: string;
  bgGradient: string;
  bgImage: string;
  navbarBgColor: string;
  navbarBgGradient: string;
  navbarBgImage: string;
  navbarTextColor?: string;
  navbarAccentColor?: string;
  textColor?: string;
  presetId: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: {
    _id: string;
    name: string;
    slug: string;
  } | string;
  brand: string;
  mrp: number;
  sellingPrice: number;
  discount: number;
  stock: number;
  sku: string;
  tags: string[];
  featured: boolean;
  trending: boolean;
  specifications: Record<string, string>;
  weight?: string;
  images: string[];
  rating: number;
  numReviews: number;
  availability: 'in_stock' | 'out_of_stock' | 'discontinued';
  isDeleted?: boolean;
}

export interface Address {
  _id?: string;
  type: 'Home' | 'Office' | 'Other' | 'Current';
  name: string;
  phone: string;
  fullAddress: string;
  area: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export interface Warehouse {
  _id: string;
  name: string;
  code: string;
  fullAddress: string;
  area: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  managerName: string;
  managerPhone: string;
  supportedRadiusKm: number;
  isActive: boolean;
}

export interface DeliveryPartner {
  _id: string;
  partnerId: string;
  name: string;
  phone: string;
  vehicleType: 'Bike' | 'Van' | 'Truck';
  providerType: 'Internal' | 'Shiprocket' | 'Delhivery' | 'BlueDart' | 'DTDC' | 'IndiaPost' | 'AmazonShipping';
  availability: 'Available' | 'On Delivery' | 'Off Duty';
  assignedOrdersCount: number;
  rating: number;
  isActive: boolean;
}

export interface OrderItem {
  product: Product | string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface OrderStatusHistory {
  status: string;
  note?: string;
  updatedBy?: string;
  timestamp: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: User | string;
  items: OrderItem[];
  shippingAddress: Address;
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
  deliveryPartner: string;
  assignedWarehouse?: Warehouse;
  assignedPartner?: DeliveryPartner;
  courierName?: string;
  dispatchDate?: string;
  estimatedDeliveryDate: string;
  statusHistory: OrderStatusHistory[];
  createdAt: string;
  liveLocation?: {
    latitude: number;
    longitude: number;
    updatedAt: string;
  };
}

export interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    photo?: string;
  };
  product: string;
  rating: number;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  likes: string[];
  createdAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

export interface PaymentRecord {
  _id: string;
  order: Order;
  user: User;
  paymentMethod: 'qr_code' | 'cod';
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  proofImage?: string;
  transactionId?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'account' | 'promo' | 'system';
  read: boolean;
  link?: string;
  createdAt: string;
}
