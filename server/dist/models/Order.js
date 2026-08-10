"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const OrderSchema = new mongoose_1.Schema({
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [
        {
            product: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', required: true },
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
    assignedWarehouse: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Warehouse' },
    assignedPartner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'DeliveryPartner' },
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
}, { timestamps: true });
// Compound indexes for analytics aggregation performance
OrderSchema.index({ orderStatus: 1, createdAt: -1 });
OrderSchema.index({ 'paymentInfo.status': 1, createdAt: -1 });
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ createdAt: -1 });
exports.default = mongoose_1.default.model('Order', OrderSchema);
