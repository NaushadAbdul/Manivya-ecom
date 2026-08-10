import { Router } from 'express';
import {
  getHero3DCategories,
  getAllHero3DCategoriesAdmin,
  createHero3DCategory,
  updateHero3DCategory,
  deleteHero3DCategory,
} from '../controllers/hero3dController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = Router();

// Public
router.get('/', getHero3DCategories);

// Admin Only
router.get('/admin', protect, adminOnly, getAllHero3DCategoriesAdmin);
router.post('/', protect, adminOnly, createHero3DCategory);
router.put('/:id', protect, adminOnly, updateHero3DCategory);
router.delete('/:id', protect, adminOnly, deleteHero3DCategory);

export default router;
