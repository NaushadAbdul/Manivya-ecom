"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPaymentAdmin = exports.getPendingPaymentsAdmin = exports.uploadPaymentProof = void 0;
const Payment_1 = __importDefault(require("../models/Payment"));
const Order_1 = __importDefault(require("../models/Order"));
const cloudinary_1 = require("../config/cloudinary");
const apiResponse_1 = require("../utils/apiResponse");
const notificationService_1 = require("../services/notificationService");
const uploadPaymentProof = async (req, res) => {
    try {
        if (!req.user)
            return (0, apiResponse_1.sendError)(res, 'Unauthorized', 401);
        const { orderId, transactionId } = req.body;
        const file = req.file;
        const order = await Order_1.default.findById(orderId);
        if (!order)
            return (0, apiResponse_1.sendError)(res, 'Order not found', 404);
        let proofImage = '';
        if (file) {
            proofImage = await (0, cloudinary_1.uploadToCloudinary)(file.buffer, 'manivya/payments');
        }
        else if (req.body.proofImage) {
            proofImage = req.body.proofImage;
        }
        if (!proofImage) {
            return (0, apiResponse_1.sendError)(res, 'Payment screenshot or proof image is required', 400);
        }
        let payment = await Payment_1.default.findOne({ order: orderId });
        if (!payment) {
            payment = new Payment_1.default({
                order: orderId,
                user: req.user._id,
                paymentMethod: 'qr_code',
                amount: order.totalAmount,
            });
        }
        payment.proofImage = proofImage;
        payment.transactionId = transactionId || '';
        payment.status = 'Pending';
        await payment.save();
        order.paymentInfo.proofImage = proofImage;
        order.paymentInfo.transactionId = transactionId || '';
        order.paymentInfo.status = 'Pending';
        await order.save();
        await notificationService_1.NotificationService.sendNotification(req.user._id.toString(), 'Payment Proof Submitted', `Payment proof for Order #${order.orderNumber} submitted. Pending admin verification.`, 'payment');
        return (0, apiResponse_1.sendSuccess)(res, payment, 'Payment proof uploaded successfully');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.uploadPaymentProof = uploadPaymentProof;
const getPendingPaymentsAdmin = async (_req, res) => {
    try {
        const payments = await Payment_1.default.find({ status: 'Pending' })
            .populate('order')
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 });
        return (0, apiResponse_1.sendSuccess)(res, payments, 'Pending payments retrieved');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getPendingPaymentsAdmin = getPendingPaymentsAdmin;
const verifyPaymentAdmin = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { action, rejectionReason } = req.body; // 'approve' | 'reject'
        if (!['approve', 'reject'].includes(action)) {
            return (0, apiResponse_1.sendError)(res, 'Action must be approve or reject', 400);
        }
        const payment = await Payment_1.default.findById(paymentId);
        if (!payment)
            return (0, apiResponse_1.sendError)(res, 'Payment record not found', 404);
        const order = await Order_1.default.findById(payment.order);
        if (!order)
            return (0, apiResponse_1.sendError)(res, 'Associated order not found', 404);
        if (action === 'approve') {
            payment.status = 'Approved';
            payment.verifiedBy = req.user?._id;
            payment.verifiedAt = new Date();
            order.paymentInfo.status = 'Verified';
            order.orderStatus = 'Confirmed';
            await notificationService_1.NotificationService.sendNotification(order.user.toString(), 'Payment Approved!', `Your QR Code payment of ₹${payment.amount} for Order #${order.orderNumber} has been verified and approved.`, 'payment', `/orders/${order._id}`);
        }
        else {
            payment.status = 'Rejected';
            payment.rejectionReason = rejectionReason || 'Invalid transaction screenshot or amount mismatch.';
            order.paymentInfo.status = 'Rejected';
            order.paymentInfo.rejectionReason = payment.rejectionReason;
            await notificationService_1.NotificationService.sendNotification(order.user.toString(), 'Payment Verification Rejected', `Payment proof for Order #${order.orderNumber} was rejected: ${payment.rejectionReason}. Please re-upload valid proof.`, 'payment', `/orders/${order._id}`);
        }
        await payment.save();
        await order.save();
        return (0, apiResponse_1.sendSuccess)(res, { payment, order }, `Payment successfully ${action}d`);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.verifyPaymentAdmin = verifyPaymentAdmin;
