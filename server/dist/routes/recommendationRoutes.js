"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const recommendationController_1 = require("../controllers/recommendationController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Optional authentication to personalize if user is logged in
router.get('/personalized', (req, res, next) => {
    if (req.headers.authorization) {
        return (0, authMiddleware_1.authenticate)(req, res, next);
    }
    next();
}, recommendationController_1.getPersonalizedRecommendations);
router.get('/related/:productId', recommendationController_1.getRelatedProducts);
exports.default = router;
