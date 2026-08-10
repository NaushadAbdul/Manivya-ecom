"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockUnblockUser = exports.updateUserRole = exports.getAllUsers = exports.syncUserWithMongo = exports.updateProfile = exports.getCurrentUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const apiResponse_1 = require("../utils/apiResponse");
const notificationService_1 = require("../services/notificationService");
const adminCheck_1 = require("../utils/adminCheck");
const getCurrentUser = async (req, res) => {
    try {
        if (!req.user)
            return (0, apiResponse_1.sendError)(res, 'User not found', 444);
        return (0, apiResponse_1.sendSuccess)(res, req.user, 'Current user profile fetched successfully');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getCurrentUser = getCurrentUser;
const updateProfile = async (req, res) => {
    try {
        if (!req.user)
            return (0, apiResponse_1.sendError)(res, 'Unauthorized', 401);
        const { name, phone, photo } = req.body;
        const user = await User_1.default.findById(req.user._id);
        if (!user)
            return (0, apiResponse_1.sendError)(res, 'User profile not found', 404);
        if (name)
            user.name = name;
        if (phone)
            user.phone = phone;
        if (photo)
            user.photo = photo;
        await user.save();
        return (0, apiResponse_1.sendSuccess)(res, user, 'Profile updated successfully');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.updateProfile = updateProfile;
const syncUserWithMongo = async (req, res) => {
    try {
        const { uid, name, email, photo, provider } = req.body;
        const normalizedEmail = email ? email.toLowerCase().trim() : '';
        let user = await User_1.default.findOne({
            $or: [
                { uid },
                ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
            ],
        });
        if (!user) {
            user = await User_1.default.create({
                uid,
                name: name || normalizedEmail.split('@')[0],
                email: normalizedEmail,
                photo: photo || '',
                provider: provider || 'google',
                role: (0, adminCheck_1.isDefinedAdminEmail)(normalizedEmail) ? 'admin' : 'customer',
                lastLogin: new Date(),
            });
            await notificationService_1.NotificationService.sendNotification(user._id.toString(), 'Welcome to MANIVYA Enterprises!', 'Thank you for registering. Explore our premium AI-curated catalog and enjoy special welcoming perks.', 'account');
        }
        else {
            user.uid = uid;
            if ((0, adminCheck_1.isDefinedAdminEmail)(normalizedEmail) && user.role !== 'admin') {
                user.role = 'admin';
            }
            user.lastLogin = new Date();
            if (name)
                user.name = name;
            if (photo)
                user.photo = photo;
            await user.save();
        }
        return (0, apiResponse_1.sendSuccess)(res, user, 'User synchronized successfully');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.syncUserWithMongo = syncUserWithMongo;
const getAllUsers = async (req, res) => {
    try {
        const users = await User_1.default.find().sort({ createdAt: -1 });
        return (0, apiResponse_1.sendSuccess)(res, users, 'Users retrieved successfully');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getAllUsers = getAllUsers;
const updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;
        if (!['customer', 'admin'].includes(role)) {
            return (0, apiResponse_1.sendError)(res, 'Invalid role specified', 400);
        }
        const user = await User_1.default.findByIdAndUpdate(userId, { role }, { new: true });
        if (!user)
            return (0, apiResponse_1.sendError)(res, 'User not found', 404);
        return (0, apiResponse_1.sendSuccess)(res, user, `User role updated to ${role}`);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.updateUserRole = updateUserRole;
const blockUnblockUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status, blockedReason } = req.body;
        if (!['active', 'blocked'].includes(status)) {
            return (0, apiResponse_1.sendError)(res, 'Invalid user status specified', 400);
        }
        const user = await User_1.default.findById(userId);
        if (!user)
            return (0, apiResponse_1.sendError)(res, 'User not found', 404);
        user.status = status;
        if (status === 'blocked') {
            user.blockedReason = blockedReason || 'Account flagged by administrator.';
        }
        else {
            user.blockedReason = '';
        }
        await user.save();
        return (0, apiResponse_1.sendSuccess)(res, user, `User account ${status === 'blocked' ? 'blocked' : 'unblocked'}`);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.blockUnblockUser = blockUnblockUser;
