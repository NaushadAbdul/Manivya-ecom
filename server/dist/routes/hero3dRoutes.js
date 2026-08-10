"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hero3dController_1 = require("../controllers/hero3dController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public
router.get('/', hero3dController_1.getHero3DCategories);
// Admin Only
router.get('/admin', authMiddleware_1.protect, authMiddleware_1.adminOnly, hero3dController_1.getAllHero3DCategoriesAdmin);
router.post('/', authMiddleware_1.protect, authMiddleware_1.adminOnly, hero3dController_1.createHero3DCategory);
router.put('/:id', authMiddleware_1.protect, authMiddleware_1.adminOnly, hero3dController_1.updateHero3DCategory);
router.delete('/:id', authMiddleware_1.protect, authMiddleware_1.adminOnly, hero3dController_1.deleteHero3DCategory);
exports.default = router;
