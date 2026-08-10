import { Router } from 'express';
import { getProductReviews, createReview, likeReview } from '../controllers/reviewController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/product/:productId', getProductReviews);
router.post('/', authenticate, createReview);
router.patch('/:reviewId/like', authenticate, likeReview);

export default router;
