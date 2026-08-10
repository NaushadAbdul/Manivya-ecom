import { Router } from 'express';
import {
  getCategories,
  getAllCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getCategories);
router.get('/admin', authenticate, requireAdmin, getAllCategoriesAdmin);
router.post('/', authenticate, requireAdmin, createCategory);
router.put('/:id', authenticate, requireAdmin, updateCategory);
router.delete('/:id', authenticate, requireAdmin, deleteCategory);

export default router;
