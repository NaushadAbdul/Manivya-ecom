import { Router } from 'express';
import { getWishlist, toggleWishlistItem, clearWishlist } from '../controllers/wishlistController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getWishlist);
router.post('/toggle', toggleWishlistItem);
router.delete('/', clearWishlist);

export default router;
