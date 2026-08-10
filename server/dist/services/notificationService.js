"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const Notification_1 = __importDefault(require("../models/Notification"));
class NotificationService {
    static async sendNotification(userId, title, message, type = 'system', link) {
        try {
            const notification = await Notification_1.default.create({
                user: userId,
                title,
                message,
                type,
                link: link || '',
            });
            console.log(`[Notification Sent] User: ${userId} | ${title}`);
            return notification;
        }
        catch (err) {
            console.error('[Notification Error]', err);
        }
    }
}
exports.NotificationService = NotificationService;
