"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getAllCategoriesAdmin = exports.getCategories = void 0;
const Category_1 = __importDefault(require("../models/Category"));
const apiResponse_1 = require("../utils/apiResponse");
const getCategories = async (_req, res) => {
    try {
        const categories = await Category_1.default.find({ isActive: true }).sort({ name: 1 });
        return (0, apiResponse_1.sendSuccess)(res, categories, 'Categories fetched successfully');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getCategories = getCategories;
const getAllCategoriesAdmin = async (_req, res) => {
    try {
        const categories = await Category_1.default.find().sort({ createdAt: -1 });
        return (0, apiResponse_1.sendSuccess)(res, categories, 'All categories fetched for admin');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getAllCategoriesAdmin = getAllCategoriesAdmin;
const createCategory = async (req, res) => {
    try {
        const { name, description, image, introVideo } = req.body;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const category = await Category_1.default.create({ name, slug, description, image, introVideo });
        return (0, apiResponse_1.sendSuccess)(res, category, 'Category created successfully', 201);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category_1.default.findByIdAndUpdate(id, req.body, { new: true });
        if (!category)
            return (0, apiResponse_1.sendError)(res, 'Category not found', 404);
        return (0, apiResponse_1.sendSuccess)(res, category, 'Category updated successfully');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category_1.default.findByIdAndDelete(id);
        if (!category)
            return (0, apiResponse_1.sendError)(res, 'Category not found', 404);
        return (0, apiResponse_1.sendSuccess)(res, null, 'Category deleted successfully');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.deleteCategory = deleteCategory;
