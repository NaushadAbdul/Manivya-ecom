import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Payment from '../models/Payment';
import Order from '../models/Order';
import { uploadToCloudinary } from '../config/cloudinary';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { NotificationService } from '../services/notificationService';

export const uploadPaymentProof = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const { orderId, transactionId } = req.body;
    const file = req.file;

    const order = await Order.findById(orderId);
    if (!order) return sendError(res, 'Order not found', 404);

    const isOwner = order.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return sendError(res, 'Forbidden: You do not have permission to upload payment proof for this order', 403);
    }

    let proofImage = '';
    if (file) {
      proofImage = await uploadToCloudinary(file.buffer, 'manivya/payments');
    } else if (req.body.proofImage) {
      proofImage = req.body.proofImage;
    }

    if (!proofImage) {
      return sendError(res, 'Payment screenshot or proof image is required', 400);
    }

    let payment = await Payment.findOne({ order: orderId });
    if (!payment) {
      payment = new Payment({
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

    await NotificationService.sendNotification(
      req.user._id.toString(),
      'Payment Proof Submitted',
      `Payment proof for Order #${order.orderNumber} submitted. Pending admin verification.`,
      'payment'
    );

    return sendSuccess(res, payment, 'Payment proof uploaded successfully');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const getPendingPaymentsAdmin = async (_req: AuthRequest, res: Response) => {
  try {
    const payments = await Payment.find({ status: 'Pending' })
      .populate('order')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    return sendSuccess(res, payments, 'Pending payments retrieved');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const verifyPaymentAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { paymentId } = req.params;
    const { action, rejectionReason } = req.body; // 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return sendError(res, 'Action must be approve or reject', 400);
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) return sendError(res, 'Payment record not found', 404);

    const order = await Order.findById(payment.order);
    if (!order) return sendError(res, 'Associated order not found', 404);

    if (action === 'approve') {
      payment.status = 'Approved';
      payment.verifiedBy = req.user?._id;
      payment.verifiedAt = new Date();

      order.paymentInfo.status = 'Verified';
      order.orderStatus = 'Confirmed';

      await NotificationService.sendNotification(
        order.user.toString(),
        'Payment Approved!',
        `Your QR Code payment of ₹${payment.amount} for Order #${order.orderNumber} has been verified and approved.`,
        'payment',
        `/orders/${order._id}`
      );
    } else {
      payment.status = 'Rejected';
      payment.rejectionReason = rejectionReason || 'Invalid transaction screenshot or amount mismatch.';

      order.paymentInfo.status = 'Rejected';
      order.paymentInfo.rejectionReason = payment.rejectionReason;

      await NotificationService.sendNotification(
        order.user.toString(),
        'Payment Verification Rejected',
        `Payment proof for Order #${order.orderNumber} was rejected: ${payment.rejectionReason}. Please re-upload valid proof.`,
        'payment',
        `/orders/${order._id}`
      );
    }

    await payment.save();
    await order.save();

    return sendSuccess(res, { payment, order }, `Payment successfully ${action}d`);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};
