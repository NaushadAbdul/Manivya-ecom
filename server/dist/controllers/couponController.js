"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCouponAdmin = exports.createCouponAdmin = exports.getCouponsAdmin = exports.validateCoupon = void 0;
const Coupon_1 = __importDefault(require("../models/Coupon"));
const apiResponse_1 = require("../utils/apiResponse");
const validateCoupon = async (req, res) => {
    try {
        const { code, subtotal } = req.body;
        const coupon = await Coupon_1.default.findOne({ code: code.toUpperCase(), isActive: true });
        if (!coupon)
            return (0, apiResponse_1.sendError)(res, 'Invalid or expired coupon code', 400);
        if (new Date() > new Date(coupon.expiryDate)) {
            return (0, apiResponse_1.sendError)(res, 'Coupon has expired', 400);
        }
        if (coupon.usedCount >= coupon.usageLimit) {
            return (0, apiResponse_1.sendError)(res, 'Coupon usage limit reached', 400);
        }
        const orderSubtotal = parseFloat(subtotal);
        if (orderSubtotal < coupon.minOrderAmount) {
            return (0, apiResponse_1.sendError)(res, `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`, 400);
        }
        let discount = 0;
        if (coupon.discountType === 'percentage') {
            discount = (orderSubtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
            }
        }
        else {
            discount = coupon.discountValue;
        }
        return (0, apiResponse_1.sendSuccess)(res, { coupon, discount }, 'Coupon applied successfully');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.validateCoupon = validateCoupon;
const getCouponsAdmin = async (_req, res) => {
    try {
        const coupons = await Coupon_1.default.find().sort({ createdAt: -1 });
        return (0, apiResponse_1.sendSuccess)(res, coupons, 'Coupons fetched');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getCouponsAdmin = getCouponsAdmin;
const createCouponAdmin = async (req, res) => {
    try {
        const { code, discountType, discountValue, minOrderAmount, maxDiscount, expiryDate, usageLimit } = req.body;
        const coupon = await Coupon_1.default.create({
            code: code.toUpperCase(),
            discountType,
            discountValue: parseFloat(discountValue),
            minOrderAmount: parseFloat(minOrderAmount) || 0,
            maxDiscount: parseFloat(maxDiscount) || 0,
            expiryDate,
            usageLimit: parseInt(usageLimit) || 100,
        });
        return (0, apiResponse_1.sendSuccess)(res, coupon, 'Coupon created successfully', 201);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.createCouponAdmin = createCouponAdmin;
const deleteCouponAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        await Coupon_1.default.findByIdAndDelete(id);
        return (0, apiResponse_1.sendSuccess)(res, null, 'Coupon deleted');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.deleteCouponAdmin = deleteCouponAdmin;
