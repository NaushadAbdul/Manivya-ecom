import { Router } from 'express';
import { getTheme, updateTheme } from '../controllers/themeController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getTheme);
router.put('/', protect, adminOnly, updateTheme);

export default router;
