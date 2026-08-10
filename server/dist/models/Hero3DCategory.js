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
const Hero3DCategorySchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    watermark: { type: String, required: true },
    badge: { type: String, default: 'NEW' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    priceDisplay: { type: String, default: '$12.00' },
    priceValue: { type: Number, default: 12.00 },
    bgGradient: { type: String, required: true },
    bgSolid: { type: String, required: true },
    cardBg: { type: String, default: 'rgba(255,255,255,0.5)' },
    badgeColor: { type: String, default: '#7c2d12' },
    textColor: { type: String, default: '#0f172a' },
    buttonBg: { type: String, default: '#7c2d12' },
    image: { type: String, required: true },
    introVideo: { type: String, default: '' },
    slug: { type: String, required: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
const Hero3DCategory = mongoose_1.default.model('Hero3DCategory', Hero3DCategorySchema);
exports.default = Hero3DCategory;
