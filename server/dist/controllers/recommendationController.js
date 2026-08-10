"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRelatedProducts = exports.getPersonalizedRecommendations = void 0;
const recommendationEngine_1 = require("../services/recommendationEngine");
const apiResponse_1 = require("../utils/apiResponse");
const getPersonalizedRecommendations = async (req, res) => {
    try {
        const userId = req.user ? req.user._id.toString() : undefined;
        const limit = parseInt(req.query.limit) || 8;
        const products = await recommendationEngine_1.RecommendationEngine.getPersonalizedRecommendations(userId, limit);
        return (0, apiResponse_1.sendSuccess)(res, products, 'AI Personalized recommendations generated');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getPersonalizedRecommendations = getPersonalizedRecommendations;
const getRelatedProducts = async (req, res) => {
    try {
        const { productId } = req.params;
        const limit = parseInt(req.query.limit) || 4;
        const products = await recommendationEngine_1.RecommendationEngine.getRelatedProducts(productId, limit);
        return (0, apiResponse_1.sendSuccess)(res, products, 'Related products retrieved');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getRelatedProducts = getRelatedProducts;
