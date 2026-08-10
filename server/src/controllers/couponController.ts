import { Request, Response } from 'express';
import Coupon from '../models/Coupon';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const validateCoupon = async (req: Request, res: Response) => {
  try {
    const { code, subtotal } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) return sendError(res, 'Invalid or expired coupon code', 400);

    if (new Date() > new Date(coupon.expiryDate)) {
      return sendError(res, 'Coupon has expired', 400);
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return sendError(res, 'Coupon usage limit reached', 400);
    }

    const orderSubtotal = parseFloat(subtotal);
    if (orderSubtotal < coupon.minOrderAmount) {
      return sendError(res, `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`, 400);
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (orderSubtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    return sendSuccess(res, { coupon, discount }, 'Coupon applied successfully');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const getCouponsAdmin = async (_req: Request, res: Response) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return sendSuccess(res, coupons, 'Coupons fetched');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const createCouponAdmin = async (req: Request, res: Response) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, maxDiscount, expiryDate, usageLimit } = req.body;
    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue: parseFloat(discountValue),
      minOrderAmount: parseFloat(minOrderAmount) || 0,
      maxDiscount: parseFloat(maxDiscount) || 0,
      expiryDate,
      usageLimit: parseInt(usageLimit) || 100,
    });

    return sendSuccess(res, coupon, 'Coupon created successfully', 201);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const deleteCouponAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Coupon.findByIdAndDelete(id);
    return sendSuccess(res, null, 'Coupon deleted');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};
