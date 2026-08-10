import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { RecommendationEngine } from '../services/recommendationEngine';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getPersonalizedRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user ? req.user._id.toString() : undefined;
    const limit = parseInt(req.query.limit as string) || 8;

    const products = await RecommendationEngine.getPersonalizedRecommendations(userId, limit);
    return sendSuccess(res, products, 'AI Personalized recommendations generated');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const getRelatedProducts = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit as string) || 4;

    const products = await RecommendationEngine.getRelatedProducts(productId, limit);
    return sendSuccess(res, products, 'Related products retrieved');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};
