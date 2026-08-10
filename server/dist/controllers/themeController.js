"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTheme = exports.getTheme = void 0;
const Theme_1 = __importDefault(require("../models/Theme"));
const apiResponse_1 = require("../utils/apiResponse");
const getTheme = async (_req, res) => {
    try {
        let theme = await Theme_1.default.findOne().sort({ updatedAt: -1 });
        if (!theme) {
            theme = await Theme_1.default.create({
                bgType: 'gradient',
                navbarBgType: 'gradient',
                bgColor: '#1c0d06',
                bgGradient: 'linear-gradient(135deg, #1c0d06 0%, #3a1a0b 50%, #140803 100%)',
                bgImage: '',
                navbarBgColor: '#241108',
                navbarBgGradient: 'linear-gradient(90deg, #1c0d06 0%, #2d140a 50%, #140803 100%)',
                navbarBgImage: '',
                navbarTextColor: '#ffffff',
                navbarAccentColor: '#fbbf24',
                textColor: '#f8fafc',
                presetId: 'cosmic-amber',
            });
        }
        return (0, apiResponse_1.sendSuccess)(res, theme, 'Theme settings retrieved successfully');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getTheme = getTheme;
const updateTheme = async (req, res) => {
    try {
        const { bgType, navbarBgType, bgColor, bgGradient, bgImage, navbarBgColor, navbarBgGradient, navbarBgImage, navbarTextColor, navbarAccentColor, textColor, presetId, } = req.body;
        let theme = await Theme_1.default.findOne().sort({ updatedAt: -1 });
        if (theme) {
            theme.bgType = bgType ?? theme.bgType;
            theme.navbarBgType = navbarBgType ?? theme.navbarBgType;
            theme.bgColor = bgColor ?? theme.bgColor;
            theme.bgGradient = bgGradient ?? theme.bgGradient;
            theme.bgImage = bgImage ?? theme.bgImage;
            theme.navbarBgColor = navbarBgColor ?? theme.navbarBgColor;
            theme.navbarBgGradient = navbarBgGradient ?? theme.navbarBgGradient;
            theme.navbarBgImage = navbarBgImage ?? theme.navbarBgImage;
            theme.navbarTextColor = navbarTextColor ?? theme.navbarTextColor;
            theme.navbarAccentColor = navbarAccentColor ?? theme.navbarAccentColor;
            theme.textColor = textColor ?? theme.textColor;
            theme.presetId = presetId ?? theme.presetId;
            await theme.save();
        }
        else {
            theme = await Theme_1.default.create(req.body);
        }
        return (0, apiResponse_1.sendSuccess)(res, theme, 'Theme settings updated successfully');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.updateTheme = updateTheme;
