"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const themeController_1 = require("../controllers/themeController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', themeController_1.getTheme);
router.put('/', authMiddleware_1.protect, authMiddleware_1.adminOnly, themeController_1.updateTheme);
exports.default = router;
