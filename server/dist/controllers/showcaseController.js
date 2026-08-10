"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateShowcase = exports.getShowcase = void 0;
const Showcase_1 = __importDefault(require("../models/Showcase"));
const apiResponse_1 = require("../utils/apiResponse");
// GET /api/showcase  — public
const getShowcase = async (_req, res) => {
    try {
        let showcase = await Showcase_1.default.findOne({});
        if (showcase) {
            return (0, apiResponse_1.sendSuccess)(res, showcase.slides, 'Showcase slides retrieved');
        }
        return (0, apiResponse_1.sendSuccess)(res, [], 'Showcase slides retrieved');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getShowcase = getShowcase;
// PUT /api/showcase  — admin only
const updateShowcase = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return (0, apiResponse_1.sendError)(res, 'Admin access required', 403);
        }
        const { slides } = req.body;
        if (!Array.isArray(slides)) {
            return (0, apiResponse_1.sendError)(res, 'Slides must be an array', 400);
        }
        // Validate each slide has a src
        for (const s of slides) {
            if (!s.src || !s.src.trim()) {
                return (0, apiResponse_1.sendError)(res, 'All slides must have a valid image URL', 400);
            }
        }
        let showcase = await Showcase_1.default.findOne({});
        if (!showcase) {
            showcase = new Showcase_1.default({ slides: [], updatedBy: req.user._id });
        }
        showcase.slides = slides;
        showcase.updatedBy = req.user._id;
        await showcase.save();
        return (0, apiResponse_1.sendSuccess)(res, showcase.slides, 'Showcase updated successfully');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.updateShowcase = updateShowcase;
