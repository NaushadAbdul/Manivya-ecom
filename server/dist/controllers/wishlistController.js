"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearWishlist = exports.toggleWishlistItem = exports.getWishlist = void 0;
const Wishlist_1 = __importDefault(require("../models/Wishlist"));
const Product_1 = __importDefault(require("../models/Product"));
const ProductActivity_1 = __importDefault(require("../models/ProductActivity"));
const apiResponse_1 = require("../utils/apiResponse");
const getWishlist = async (req, res) => {
    try {
        if (!req.user)
            return (0, apiResponse_1.sendError)(res, 'Unauthorized', 401);
        let wishlist = await Wishlist_1.default.findOne({ user: req.user._id }).populate({
            path: 'products',
            match: { isDeleted: false },
            populate: { path: 'category', select: 'name slug' },
        });
        if (!wishlist) {
            wishlist = await Wishlist_1.default.create({ user: req.user._id, products: [] });
        }
        return (0, apiResponse_1.sendSuccess)(res, wishlist.products, 'Wishlist retrieved successfully');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getWishlist = getWishlist;
const toggleWishlistItem = async (req, res) => {
    try {
        if (!req.user)
            return (0, apiResponse_1.sendError)(res, 'Unauthorized', 401);
        const { productId } = req.body;
        if (!productId)
            return (0, apiResponse_1.sendError)(res, 'ProductId required', 400);
        const productDoc = await Product_1.default.findById(productId);
        if (!productDoc)
            return (0, apiResponse_1.sendError)(res, 'Product not found', 404);
        let wishlist = await Wishlist_1.default.findOne({ user: req.user._id });
        if (!wishlist) {
            wishlist = await Wishlist_1.default.create({ user: req.user._id, products: [] });
        }
        const prodIdStr = productDoc._id.toString();
        const existingIndex = wishlist.products.findIndex((p) => p.toString() === prodIdStr);
        let added = false;
        if (existingIndex > -1) {
            wishlist.products.splice(existingIndex, 1);
        }
        else {
            wishlist.products.push(productDoc._id);
            added = true;
        }
        await wishlist.save();
        // Asynchronously log product activity
        if (added) {
            ProductActivity_1.default.create({
                user: req.user._id,
                userName: req.user.name,
                userEmail: req.user.email,
                product: productDoc._id,
                productName: productDoc.name,
                productImage: (productDoc.images && productDoc.images[0]) || '',
                action: 'wishlist_add',
                timestamp: new Date(),
            }).catch(() => { });
        }
        // Return populated products list
        const updatedWishlist = await Wishlist_1.default.findById(wishlist._id).populate('products');
        return (0, apiResponse_1.sendSuccess)(res, {
            added,
            products: updatedWishlist?.products || [],
        }, added ? 'Product added to wishlist' : 'Product removed from wishlist');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.toggleWishlistItem = toggleWishlistItem;
const clearWishlist = async (req, res) => {
    try {
        if (!req.user)
            return (0, apiResponse_1.sendError)(res, 'Unauthorized', 401);
        await Wishlist_1.default.findOneAndUpdate({ user: req.user._id }, { products: [] });
        return (0, apiResponse_1.sendSuccess)(res, [], 'Wishlist cleared');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.clearWishlist = clearWishlist;
