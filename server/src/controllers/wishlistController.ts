import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Wishlist from '../models/Wishlist';
import Product from '../models/Product';
import ProductActivity from '../models/ProductActivity';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getWishlist = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products',
      match: { isDeleted: false },
      populate: { path: 'category', select: 'name slug' },
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    return sendSuccess(res, wishlist.products, 'Wishlist retrieved successfully');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const toggleWishlistItem = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const { productId } = req.body;
    if (!productId) return sendError(res, 'ProductId required', 400);

    const productDoc = await Product.findById(productId);
    if (!productDoc) return sendError(res, 'Product not found', 404);

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    const prodIdStr = productDoc._id.toString();
    const existingIndex = wishlist.products.findIndex((p) => p.toString() === prodIdStr);

    let added = false;
    if (existingIndex > -1) {
      wishlist.products.splice(existingIndex, 1);
    } else {
      wishlist.products.push(productDoc._id);
      added = true;
    }

    await wishlist.save();

    // Asynchronously log product activity
    if (added) {
      ProductActivity.create({
        user: req.user._id,
        userName: req.user.name,
        userEmail: req.user.email,
        product: productDoc._id,
        productName: productDoc.name,
        productImage: (productDoc.images && productDoc.images[0]) || '',
        action: 'wishlist_add',
        timestamp: new Date(),
      }).catch(() => {});
    }

    // Return populated products list
    const updatedWishlist = await Wishlist.findById(wishlist._id).populate('products');

    return sendSuccess(
      res,
      {
        added,
        products: updatedWishlist?.products || [],
      },
      added ? 'Product added to wishlist' : 'Product removed from wishlist'
    );
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const clearWishlist = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    await Wishlist.findOneAndUpdate({ user: req.user._id }, { products: [] });
    return sendSuccess(res, [], 'Wishlist cleared');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};
