"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationEngine = void 0;
const Product_1 = __importDefault(require("../models/Product"));
class RecommendationEngine {
    /**
     * Fetches real products stored in MongoDB Atlas for recommendations.
     * Does NOT generate AI recommendations or mock items.
     * Returns [] if no products exist in the database.
     */
    static async getPersonalizedRecommendations(_userId, limit = 8) {
        try {
            const products = await Product_1.default.find({})
                .populate('category', 'name slug')
                .sort({ createdAt: -1 })
                .limit(limit);
            return products;
        }
        catch (err) {
            console.error('[Database Query Error]', err);
            return [];
        }
    }
    /**
     * Returns related items in the same category from MongoDB Atlas.
     * Returns [] if no matching products exist in the database.
     */
    static async getRelatedProducts(productId, limit = 4) {
        try {
            const currentProduct = await Product_1.default.findById(productId);
            if (!currentProduct)
                return [];
            return await Product_1.default.find({
                _id: { $ne: productId },
                category: currentProduct.category,
            })
                .populate('category', 'name slug')
                .limit(limit);
        }
        catch (err) {
            console.error('[Related Products Error]', err);
            return [];
        }
    }
}
exports.RecommendationEngine = RecommendationEngine;
