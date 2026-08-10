"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const router = (0, express_1.Router)();
router.get('/', productController_1.getProducts);
router.get('/:identifier', productController_1.getProductBySlugOrId);
// Admin Routes
router.post('/', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, uploadMiddleware_1.upload.array('images', 5), productController_1.createProduct);
router.put('/:id', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, productController_1.updateProduct);
router.delete('/:id', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, productController_1.deleteProduct);
router.patch('/:id/restore', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, productController_1.restoreProduct);
exports.default = router;
