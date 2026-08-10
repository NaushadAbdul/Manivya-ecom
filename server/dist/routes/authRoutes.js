"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/me', authMiddleware_1.authenticate, authController_1.getCurrentUser);
router.put('/profile', authMiddleware_1.authenticate, authController_1.updateProfile);
router.post('/sync', authController_1.syncUserWithMongo);
// Admin Only Routes
router.get('/users', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, authController_1.getAllUsers);
router.patch('/users/:userId/role', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, authController_1.updateUserRole);
router.patch('/users/:userId/block', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, authController_1.blockUnblockUser);
exports.default = router;
