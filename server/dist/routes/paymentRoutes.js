"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentController_1 = require("../controllers/paymentController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const router = (0, express_1.Router)();
router.post('/upload-proof', authMiddleware_1.authenticate, uploadMiddleware_1.upload.single('proof'), paymentController_1.uploadPaymentProof);
// Admin Moderation Routes
router.get('/pending', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, paymentController_1.getPendingPaymentsAdmin);
router.patch('/verify/:paymentId', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, paymentController_1.verifyPaymentAdmin);
exports.default = router;
