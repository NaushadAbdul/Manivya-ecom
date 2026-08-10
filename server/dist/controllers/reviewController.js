"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.likeReview = exports.createReview = exports.getProductReviews = void 0;
const Review_1 = __importDefault(require("../models/Review"));
const Order_1 = __importDefault(require("../models/Order"));
const Product_1 = __importDefault(require("../models/Product"));
const apiResponse_1 = require("../utils/apiResponse");
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await Review_1.default.find({ product: productId })
            .populate('user', 'name photo')
            .sort({ createdAt: -1 });
        return (0, apiResponse_1.sendSuccess)(res, reviews, 'Product reviews fetched');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getProductReviews = getProductReviews;
const createReview = async (req, res) => {
    try {
        if (!req.user)
            return (0, apiResponse_1.sendError)(res, 'Unauthorized', 401);
        const { productId, rating, comment, images } = req.body;
        // Check if verified purchase
        const pastOrder = await Order_1.default.findOne({
            user: req.user._id,
            'items.product': productId,
            orderStatus: 'Delivered',
        });
        const isVerifiedPurchase = !!pastOrder;
        const review = await Review_1.default.create({
            user: req.user._id,
            product: productId,
            rating: parseInt(rating),
            comment,
            images: images || [],
            isVerifiedPurchase,
        });
        // Update product overall rating average
        const allReviews = await Review_1.default.find({ product: productId });
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        await Product_1.default.findByIdAndUpdate(productId, {
            rating: Math.round(avgRating * 10) / 10,
            numReviews: allReviews.length,
        });
        return (0, apiResponse_1.sendSuccess)(res, review, 'Review posted successfully', 201);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.createReview = createReview;
const likeReview = async (req, res) => {
    try {
        if (!req.user)
            return (0, apiResponse_1.sendError)(res, 'Unauthorized', 401);
        const { reviewId } = req.params;
        const review = await Review_1.default.findById(reviewId);
        if (!review)
            return (0, apiResponse_1.sendError)(res, 'Review not found', 404);
        const index = review.likes.indexOf(req.user._id);
        if (index === -1) {
            review.likes.push(req.user._id);
        }
        else {
            review.likes.splice(index, 1);
        }
        await review.save();
        return (0, apiResponse_1.sendSuccess)(res, review, 'Review like updated');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.likeReview = likeReview;
