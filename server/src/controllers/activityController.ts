import { Request, Response } from 'express';
import LoginActivity from '../models/LoginActivity';
import ProductActivity from '../models/ProductActivity';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/authMiddleware';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getLoginActivity = async (req: Request, res: Response) => {
  try {
    const { search, device, browser, isCurrentSession } = req.query;
    const query: any = {};

    if (search) {
      query.$or = [
        { email: { $regex: search as string, $options: 'i' } },
        { name: { $regex: search as string, $options: 'i' } },
        { ipAddress: { $regex: search as string, $options: 'i' } },
      ];
    }

    if (device) query.device = device;
    if (browser) query.browser = browser;
    if (isCurrentSession === 'true') query.isCurrentSession = true;

    const activities = await LoginActivity.find(query)
      .populate('user', 'name email role status photo')
      .sort({ loginTime: -1 })
      .limit(100);

    const activeSessionsCount = await LoginActivity.countDocuments({ isCurrentSession: true });
    const totalLoginsToday = await LoginActivity.countDocuments({
      loginTime: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });

    return sendSuccess(
      res,
      {
        activities,
        activeSessionsCount,
        totalLoginsToday,
      },
      'Login activity history retrieved'
    );
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const logProductActivity = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, action } = req.body;

    if (!productId || !action) {
      return sendError(res, 'productId and action required', 400);
    }

    const productDoc = await Product.findById(productId);
    if (!productDoc) return sendError(res, 'Product not found', 404);

    const activity = await ProductActivity.create({
      user: req.user?._id,
      userName: req.user ? req.user.name : 'Guest Visitor',
      userEmail: req.user ? req.user.email : '',
      product: productDoc._id,
      productName: productDoc.name,
      productImage: (productDoc.images && productDoc.images[0]) || '',
      action,
      timestamp: new Date(),
    });

    return sendSuccess(res, activity, 'Product activity logged', 201);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const getProductActivities = async (req: Request, res: Response) => {
  try {
    const activities = await ProductActivity.find()
      .populate('product', 'name slug sellingPrice images')
      .populate('user', 'name email photo')
      .sort({ createdAt: -1 })
      .limit(100);

    return sendSuccess(res, activities, 'Product activity log fetched');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};
