"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreProduct = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductBySlugOrId = exports.getProducts = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Product_1 = __importDefault(require("../models/Product"));
const Category_1 = __importDefault(require("../models/Category"));
const apiResponse_1 = require("../utils/apiResponse");
const cloudinary_1 = require("../config/cloudinary");
const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;
        const { category, brand, minPrice, maxPrice, search, sort, featured, trending, rating, availability } = req.query;
        const query = {};
        if (category && category !== 'all') {
            let catDoc = null;
            if (mongoose_1.default.Types.ObjectId.isValid(category)) {
                catDoc = await Category_1.default.findById(category);
            }
            if (!catDoc) {
                const catStr = category;
                const cleanSlug = catStr.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                catDoc = await Category_1.default.findOne({
                    $or: [
                        { slug: catStr },
                        { slug: cleanSlug },
                        { name: new RegExp(`^${catStr}$`, 'i') },
                        { name: new RegExp(catStr, 'i') },
                    ],
                });
            }
            if (catDoc) {
                query.category = catDoc._id;
            }
            else {
                query.$or = [
                    { category: category },
                    { name: new RegExp(category, 'i') },
                    { description: new RegExp(category, 'i') },
                    { tags: new RegExp(category, 'i') },
                ];
            }
        }
        if (brand) {
            query.brand = { $in: brand.split(',') };
        }
        if (minPrice || maxPrice) {
            query.sellingPrice = {};
            if (minPrice)
                query.sellingPrice.$gte = parseFloat(minPrice);
            if (maxPrice)
                query.sellingPrice.$lte = parseFloat(maxPrice);
        }
        if (rating) {
            query.rating = { $gte: parseFloat(rating) };
        }
        if (availability) {
            query.availability = availability;
        }
        if (featured === 'true')
            query.featured = true;
        if (trending === 'true')
            query.trending = true;
        if (search) {
            query.$text = { $search: search };
        }
        let sortOptions = { createdAt: -1 };
        if (sort === 'price_low')
            sortOptions = { sellingPrice: 1 };
        if (sort === 'price_high')
            sortOptions = { sellingPrice: -1 };
        if (sort === 'rating')
            sortOptions = { rating: -1 };
        if (sort === 'popularity')
            sortOptions = { numReviews: -1 };
        let total = await Product_1.default.countDocuments(query);
        let products = await Product_1.default.find(query)
            .populate('category', 'name slug')
            .sort(sortOptions)
            .skip(skip)
            .limit(limit);
        return (0, apiResponse_1.sendSuccess)(res, products, 'Products fetched successfully', 200, {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit) || 1,
        });
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getProducts = getProducts;
const getProductBySlugOrId = async (req, res) => {
    try {
        const { identifier } = req.params;
        const isObjectId = identifier.match(/^[0-9a-fA-F]{24}$/);
        const query = isObjectId ? { _id: identifier } : { slug: identifier };
        const product = await Product_1.default.findOne(query).populate('category', 'name slug');
        if (!product)
            return (0, apiResponse_1.sendError)(res, 'Product not found', 404);
        return (0, apiResponse_1.sendSuccess)(res, product, 'Product detail retrieved successfully');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getProductBySlugOrId = getProductBySlugOrId;
// Helper to guarantee valid Category ObjectId in MongoDB Atlas
const resolveCategory = async (categoryInput, imageUrl = '') => {
    let target = categoryInput;
    if (target && typeof target === 'object') {
        target = target._id || target.id || target.name || '';
    }
    const targetStr = target ? target.toString().trim() : '';
    if (targetStr && mongoose_1.default.Types.ObjectId.isValid(targetStr)) {
        const catDoc = await Category_1.default.findById(targetStr);
        if (catDoc)
            return catDoc._id;
    }
    if (!targetStr || targetStr === '[object Object]') {
        const existing = await Category_1.default.findOne({});
        if (existing)
            return existing._id;
    }
    const nameToUse = targetStr && targetStr !== '[object Object]' ? targetStr : 'General';
    const cleanSlug = nameToUse.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'general';
    let catDoc = await Category_1.default.findOne({
        $or: [
            { slug: nameToUse },
            { slug: cleanSlug },
            { name: new RegExp(`^${nameToUse}$`, 'i') },
        ],
    });
    if (!catDoc) {
        catDoc = await Category_1.default.create({
            name: nameToUse,
            slug: cleanSlug,
            description: `${nameToUse} collection`,
            image: imageUrl || '',
        });
    }
    return catDoc._id;
};
const createProduct = async (req, res) => {
    try {
        const { name, description, category, brand, mrp, sellingPrice, stock, sku, tags, featured, trending, specifications, weight, availability, } = req.body;
        if (!name || !description) {
            return (0, apiResponse_1.sendError)(res, 'Product name and description are required', 400);
        }
        const files = req.files;
        let imageUrls = [];
        if (files && files.length > 0) {
            for (const file of files) {
                const url = await (0, cloudinary_1.uploadToCloudinary)(file.buffer, 'manivya/products');
                imageUrls.push(url);
            }
        }
        if (imageUrls.length === 0 && req.body.images) {
            imageUrls = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
        }
        if (imageUrls.length === 0) {
            imageUrls = ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80'];
        }
        const mrpNum = isNaN(parseFloat(mrp)) ? (isNaN(parseFloat(sellingPrice)) ? 0 : parseFloat(sellingPrice)) : parseFloat(mrp);
        const sellingPriceNum = isNaN(parseFloat(sellingPrice)) ? mrpNum : parseFloat(sellingPrice);
        const stockNum = isNaN(parseInt(stock)) ? 0 : parseInt(stock);
        const categoryId = await resolveCategory(category, imageUrls[0]);
        const discount = mrpNum > 0 ? Math.round(((mrpNum - sellingPriceNum) / mrpNum) * 100) : 0;
        const cleanNameSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'product';
        const slug = `${cleanNameSlug}-${Date.now()}`;
        const product = await Product_1.default.create({
            name: name.trim(),
            slug,
            description: description.trim(),
            category: categoryId,
            brand: (brand || 'MANIVYA').trim(),
            mrp: mrpNum,
            sellingPrice: sellingPriceNum,
            discount,
            stock: stockNum,
            sku: (sku || `SKU-${Math.floor(100000 + Math.random() * 900000)}`).trim(),
            tags: typeof tags === 'string' ? tags.split(',').map((t) => t.trim()).filter(Boolean) : tags || [],
            featured: featured === 'true' || featured === true,
            trending: trending === 'true' || trending === true,
            specifications: typeof specifications === 'string' ? (specifications ? JSON.parse(specifications) : {}) : specifications || {},
            weight: weight || '',
            images: imageUrls,
            availability: stockNum > 0 ? (availability || 'in_stock') : 'out_of_stock',
        });
        return (0, apiResponse_1.sendSuccess)(res, product, 'Product created successfully', 201);
    }
    catch (err) {
        console.error('Error creating product:', err);
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };
        if (updates.category) {
            updates.category = await resolveCategory(updates.category, updates.images?.[0] || '');
        }
        if (updates.mrp !== undefined || updates.sellingPrice !== undefined) {
            const existingProduct = await Product_1.default.findById(id);
            const mrpNum = updates.mrp !== undefined ? parseFloat(updates.mrp) : (existingProduct?.mrp ?? 0);
            const sellingPriceNum = updates.sellingPrice !== undefined ? parseFloat(updates.sellingPrice) : (existingProduct?.sellingPrice ?? 0);
            updates.mrp = isNaN(mrpNum) ? 0 : mrpNum;
            updates.sellingPrice = isNaN(sellingPriceNum) ? 0 : sellingPriceNum;
            updates.discount = mrpNum > 0 ? Math.round(((mrpNum - sellingPriceNum) / mrpNum) * 100) : 0;
        }
        if (updates.stock !== undefined) {
            const stockNum = parseInt(updates.stock);
            updates.stock = isNaN(stockNum) ? 0 : stockNum;
            if (updates.stock === 0 && !updates.availability) {
                updates.availability = 'out_of_stock';
            }
            else if (updates.stock > 0 && updates.availability === 'out_of_stock') {
                updates.availability = 'in_stock';
            }
        }
        if (updates.tags && typeof updates.tags === 'string') {
            updates.tags = updates.tags.split(',').map((t) => t.trim()).filter(Boolean);
        }
        const product = await Product_1.default.findByIdAndUpdate(id, updates, { new: true }).populate('category', 'name slug');
        if (!product)
            return (0, apiResponse_1.sendError)(res, 'Product not found', 404);
        return (0, apiResponse_1.sendSuccess)(res, product, 'Product updated successfully');
    }
    catch (err) {
        console.error('Error updating product:', err);
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product_1.default.findByIdAndDelete(id);
        if (!product)
            return (0, apiResponse_1.sendError)(res, 'Product not found', 404);
        return (0, apiResponse_1.sendSuccess)(res, product, 'Product permanently deleted successfully');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.deleteProduct = deleteProduct;
const restoreProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product_1.default.findByIdAndUpdate(id, { isDeleted: false, availability: 'in_stock' }, { new: true });
        if (!product)
            return (0, apiResponse_1.sendError)(res, 'Product not found', 404);
        return (0, apiResponse_1.sendSuccess)(res, product, 'Product restored successfully');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.restoreProduct = restoreProduct;
