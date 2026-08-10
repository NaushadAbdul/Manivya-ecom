import { Router } from 'express';
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  calculateShipping,
} from '../controllers/addressController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticate, getAddresses);
router.post('/', authenticate, createAddress);
router.put('/:id', authenticate, updateAddress);
router.delete('/:id', authenticate, deleteAddress);
router.patch('/:id/default', authenticate, setDefaultAddress);
router.post('/calculate-shipping', calculateShipping);

export default router;
