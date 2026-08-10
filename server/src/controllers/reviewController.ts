import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Review from '../models/Review';
import Order from '../models/Order';
import Product from '../models/Product';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId })
      .populate('user', 'name photo')
      .sort({ createdAt: -1 });

    return sendSuccess(res, reviews, 'Product reviews fetched');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const { productId, rating, comment, images } = req.body;

    // Check if verified purchase
    const pastOrder = await Order.findOne({
      user: req.user._id,
      'items.product': productId,
      orderStatus: 'Delivered',
    });

    const isVerifiedPurchase = !!pastOrder;

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating: parseInt(rating),
      comment,
      images: images || [],
      isVerifiedPurchase,
    });

    // Update product overall rating average
    const allReviews = await Review.find({ product: productId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(avgRating * 10) / 10,
      numReviews: allReviews.length,
    });

    return sendSuccess(res, review, 'Review posted successfully', 201);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const likeReview = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) return sendError(res, 'Review not found', 404);

    const index = review.likes.indexOf(req.user._id);
    if (index === -1) {
      review.likes.push(req.user._id);
    } else {
      review.likes.splice(index, 1);
    }

    await review.save();
    return sendSuccess(res, review, 'Review like updated');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};
