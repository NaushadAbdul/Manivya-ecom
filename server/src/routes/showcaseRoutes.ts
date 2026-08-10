import express from 'express';
import { getShowcase, updateShowcase } from '../controllers/showcaseController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', getShowcase as any);
router.put('/', authenticate as any, updateShowcase as any);

export default router;
