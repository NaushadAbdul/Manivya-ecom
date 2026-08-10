"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductActivities = exports.logProductActivity = exports.getLoginActivity = void 0;
const LoginActivity_1 = __importDefault(require("../models/LoginActivity"));
const ProductActivity_1 = __importDefault(require("../models/ProductActivity"));
const Product_1 = __importDefault(require("../models/Product"));
const apiResponse_1 = require("../utils/apiResponse");
const getLoginActivity = async (req, res) => {
    try {
        const { search, device, browser, isCurrentSession } = req.query;
        const query = {};
        if (search) {
            query.$or = [
                { email: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
                { ipAddress: { $regex: search, $options: 'i' } },
            ];
        }
        if (device)
            query.device = device;
        if (browser)
            query.browser = browser;
        if (isCurrentSession === 'true')
            query.isCurrentSession = true;
        const activities = await LoginActivity_1.default.find(query)
            .populate('user', 'name email role status photo')
            .sort({ loginTime: -1 })
            .limit(100);
        const activeSessionsCount = await LoginActivity_1.default.countDocuments({ isCurrentSession: true });
        const totalLoginsToday = await LoginActivity_1.default.countDocuments({
            loginTime: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        });
        return (0, apiResponse_1.sendSuccess)(res, {
            activities,
            activeSessionsCount,
            totalLoginsToday,
        }, 'Login activity history retrieved');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getLoginActivity = getLoginActivity;
const logProductActivity = async (req, res) => {
    try {
        const { productId, action } = req.body;
        if (!productId || !action) {
            return (0, apiResponse_1.sendError)(res, 'productId and action required', 400);
        }
        const productDoc = await Product_1.default.findById(productId);
        if (!productDoc)
            return (0, apiResponse_1.sendError)(res, 'Product not found', 404);
        const activity = await ProductActivity_1.default.create({
            user: req.user?._id,
            userName: req.user ? req.user.name : 'Guest Visitor',
            userEmail: req.user ? req.user.email : '',
            product: productDoc._id,
            productName: productDoc.name,
            productImage: (productDoc.images && productDoc.images[0]) || '',
            action,
            timestamp: new Date(),
        });
        return (0, apiResponse_1.sendSuccess)(res, activity, 'Product activity logged', 201);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.logProductActivity = logProductActivity;
const getProductActivities = async (req, res) => {
    try {
        const activities = await ProductActivity_1.default.find()
            .populate('product', 'name slug sellingPrice images')
            .populate('user', 'name email photo')
            .sort({ createdAt: -1 })
            .limit(100);
        return (0, apiResponse_1.sendSuccess)(res, activities, 'Product activity log fetched');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getProductActivities = getProductActivities;
