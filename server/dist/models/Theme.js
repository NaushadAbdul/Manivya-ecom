"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ThemeSchema = new mongoose_1.Schema({
    bgType: {
        type: String,
        enum: ['gradient', 'image', 'color'],
        default: 'gradient',
    },
    navbarBgType: {
        type: String,
        enum: ['gradient', 'image', 'color'],
        default: 'gradient',
    },
    bgColor: {
        type: String,
        default: '#1c0d06',
    },
    bgGradient: {
        type: String,
        default: 'linear-gradient(135deg, #1c0d06 0%, #3a1a0b 50%, #140803 100%)',
    },
    bgImage: {
        type: String,
        default: '',
    },
    navbarBgColor: {
        type: String,
        default: '#241108',
    },
    navbarBgGradient: {
        type: String,
        default: 'linear-gradient(90deg, #1c0d06 0%, #2d140a 50%, #140803 100%)',
    },
    navbarBgImage: {
        type: String,
        default: '',
    },
    navbarTextColor: {
        type: String,
        default: '#ffffff',
    },
    navbarAccentColor: {
        type: String,
        default: '#fbbf24',
    },
    textColor: {
        type: String,
        default: '#f8fafc',
    },
    presetId: {
        type: String,
        default: 'cosmic-amber',
    },
}, { timestamps: true });
exports.default = mongoose_1.default.model('Theme', ThemeSchema);
