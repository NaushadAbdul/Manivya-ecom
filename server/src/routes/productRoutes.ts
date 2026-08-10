import { Router } from 'express';
import {
  getProducts,
  getProductBySlugOrId,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
} from '../controllers/productController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

router.get('/', getProducts);
router.get('/:identifier', getProductBySlugOrId);

// Admin Routes
router.post('/', authenticate, requireAdmin, upload.array('images', 5), createProduct);
router.put('/:id', authenticate, requireAdmin, updateProduct);
router.delete('/:id', authenticate, requireAdmin, deleteProduct);
router.patch('/:id/restore', authenticate, requireAdmin, restoreProduct);

export default router;
