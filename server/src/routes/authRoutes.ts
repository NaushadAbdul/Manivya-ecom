import { Router } from 'express';
import { getCurrentUser, updateProfile, deleteAccount, syncUserWithMongo, getAllUsers, updateUserRole, blockUnblockUser } from '../controllers/authController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/me', authenticate, getCurrentUser);
router.put('/profile', authenticate, updateProfile);
router.delete('/delete-account', authenticate, deleteAccount);
router.post('/sync', syncUserWithMongo);

// Admin Only Routes
router.get('/users', authenticate, requireAdmin, getAllUsers);
router.patch('/users/:userId/role', authenticate, requireAdmin, updateUserRole);
router.patch('/users/:userId/block', authenticate, requireAdmin, blockUnblockUser);

export default router;
