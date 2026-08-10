import { Router } from 'express';
import { getPersonalizedRecommendations, getRelatedProducts } from '../controllers/recommendationController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Optional authentication to personalize if user is logged in
router.get('/personalized', (req, res, next) => {
  if (req.headers.authorization) {
    return authenticate(req, res, next);
  }
  next();
}, getPersonalizedRecommendations);

router.get('/related/:productId', getRelatedProducts);

export default router;
