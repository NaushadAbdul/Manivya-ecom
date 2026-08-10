"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllNotificationsRead = exports.markNotificationRead = exports.getMyNotifications = void 0;
const Notification_1 = __importDefault(require("../models/Notification"));
const apiResponse_1 = require("../utils/apiResponse");
const getMyNotifications = async (req, res) => {
    try {
        if (!req.user)
            return (0, apiResponse_1.sendError)(res, 'Unauthorized', 401);
        const notifications = await Notification_1.default.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
        return (0, apiResponse_1.sendSuccess)(res, notifications, 'Notifications fetched successfully');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getMyNotifications = getMyNotifications;
const markNotificationRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification_1.default.findByIdAndUpdate(id, { read: true }, { new: true });
        return (0, apiResponse_1.sendSuccess)(res, notification, 'Notification marked as read');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.markNotificationRead = markNotificationRead;
const markAllNotificationsRead = async (req, res) => {
    try {
        if (!req.user)
            return (0, apiResponse_1.sendError)(res, 'Unauthorized', 401);
        await Notification_1.default.updateMany({ user: req.user._id, read: false }, { read: true });
        return (0, apiResponse_1.sendSuccess)(res, null, 'All notifications marked as read');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.markAllNotificationsRead = markAllNotificationsRead;
