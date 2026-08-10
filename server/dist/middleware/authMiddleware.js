"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOnly = exports.protect = exports.requireAdmin = exports.authenticate = void 0;
const firebase_1 = require("../config/firebase");
const User_1 = __importDefault(require("../models/User"));
const LoginActivity_1 = __importDefault(require("../models/LoginActivity"));
const apiResponse_1 = require("../utils/apiResponse");
const adminCheck_1 = require("../utils/adminCheck");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return (0, apiResponse_1.sendError)(res, 'Authentication token missing or invalid format', 401);
        }
        const token = authHeader.split(' ')[1];
        const decodedToken = await (0, firebase_1.verifyFirebaseToken)(token);
        const userEmail = decodedToken.email ? decodedToken.email.toLowerCase().trim() : '';
        let user = await User_1.default.findOne({
            $or: [
                { uid: decodedToken.uid },
                ...(userEmail ? [{ email: userEmail }] : []),
            ],
        });
        // Auto-create user record in MongoDB Atlas if first login, or link UID if existing by email
        if (!user) {
            user = await User_1.default.create({
                uid: decodedToken.uid,
                name: decodedToken.name || userEmail.split('@')[0] || 'Valued Customer',
                email: userEmail || `user_${decodedToken.uid.slice(0, 6)}@manivya.com`,
                photo: decodedToken.picture || '',
                provider: decodedToken.firebase?.sign_in_provider || 'password',
                role: (0, adminCheck_1.isDefinedAdminEmail)(userEmail) ? 'admin' : 'customer',
                status: 'active',
                loginCount: 1,
                lastLogin: new Date(),
            });
        }
        else {
            // Link Firebase UID if email matches
            if (user.uid !== decodedToken.uid) {
                user.uid = decodedToken.uid;
            }
            // Check if blocked
            if (user.status === 'blocked') {
                return (0, apiResponse_1.sendError)(res, `Forbidden: Your account has been blocked. Reason: ${user.blockedReason || 'Policy Violation'}`, 403);
            }
            if ((0, adminCheck_1.isDefinedAdminEmail)(user.email) && user.role !== 'admin') {
                user.role = 'admin';
            }
            user.lastLogin = new Date();
            user.loginCount = (user.loginCount || 1) + 1;
            await user.save();
        }
        // Record / Update Login Activity Audit Trail
        try {
            const userAgent = req.headers['user-agent'] || '';
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
            let browser = 'Chrome';
            if (userAgent.includes('Firefox'))
                browser = 'Firefox';
            else if (userAgent.includes('Safari') && !userAgent.includes('Chrome'))
                browser = 'Safari';
            else if (userAgent.includes('Edg'))
                browser = 'Edge';
            let os = 'Windows';
            if (userAgent.includes('Mac'))
                os = 'macOS';
            else if (userAgent.includes('Linux'))
                os = 'Linux';
            else if (userAgent.includes('Android'))
                os = 'Android';
            else if (userAgent.includes('iPhone') || userAgent.includes('iPad'))
                os = 'iOS';
            let device = 'Desktop';
            if (userAgent.includes('Mobi'))
                device = 'Mobile';
            else if (userAgent.includes('Tablet') || userAgent.includes('iPad'))
                device = 'Tablet';
            await LoginActivity_1.default.create({
                user: user._id,
                uid: user.uid,
                name: user.name,
                email: user.email,
                provider: user.provider,
                loginTime: new Date(),
                ipAddress: ip.split(',')[0].trim(),
                browser,
                device,
                os,
                isCurrentSession: true,
            });
        }
        catch (actErr) {
            // Silent activity log fallback
        }
        req.user = user;
        req.firebaseUid = decodedToken.uid;
        next();
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, `Authentication failed: ${error.message}`, 401);
    }
};
exports.authenticate = authenticate;
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return (0, apiResponse_1.sendError)(res, 'Forbidden: Admin access required', 403);
    }
    next();
};
exports.requireAdmin = requireAdmin;
// Aliases for compatibility
exports.protect = exports.authenticate;
exports.adminOnly = exports.requireAdmin;
