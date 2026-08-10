import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Notification from '../models/Notification';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getMyNotifications = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
    return sendSuccess(res, notifications, 'Notifications fetched successfully');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const markNotificationRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    return sendSuccess(res, notification, 'Notification marked as read');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const markAllNotificationsRead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    return sendSuccess(res, null, 'All notifications marked as read');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};
