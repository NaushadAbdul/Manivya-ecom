import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import User from '../models/User';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { NotificationService } from '../services/notificationService';
import { isDefinedAdminEmail } from '../utils/adminCheck';

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'User not found', 444);
    return sendSuccess(res, req.user, 'Current user profile fetched successfully');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const { name, phone, photo } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return sendError(res, 'User profile not found', 404);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (photo) user.photo = photo;

    await user.save();
    return sendSuccess(res, user, 'Profile updated successfully');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const syncUserWithMongo = async (req: AuthRequest, res: Response) => {
  try {
    const { uid, name, email, photo, provider, isAdminPortal } = req.body;
    const normalizedEmail = email ? email.toLowerCase().trim() : '';

    if (!uid) {
      return sendError(res, 'Provider UID is required for user synchronization', 400);
    }

    // 1. Primary lookup by Provider UID (Source of Truth)
    let user = await User.findOne({ uid });

    // 2. Secondary lookup by Email if UID not linked yet
    if (!user && normalizedEmail) {
      user = await User.findOne({ email: normalizedEmail });
    }

    const isDefinedAdmin = isDefinedAdminEmail(normalizedEmail);

    if (isAdminPortal && !isDefinedAdmin) {
      return sendError(res, 'Access Denied: This email is not authorized for Administrator access.', 403);
    }

    if (!user) {
      const initialRole = isDefinedAdmin ? 'admin' : 'customer';
      user = await User.create({
        uid,
        name: name || normalizedEmail.split('@')[0] || 'Valued User',
        email: normalizedEmail,
        photo: photo || '',
        provider: provider || 'password',
        role: initialRole,
        lastLogin: new Date(),
      });

      await NotificationService.sendNotification(
        user._id.toString(),
        'Welcome to MANIVYA Enterprises!',
        initialRole === 'admin'
          ? 'Your Administrator Partner account has been successfully initialized.'
          : 'Thank you for registering. Explore our premium catalog and enjoy special perks.',
        'account'
      );
    } else {
      user.uid = uid; // Ensure Google/Firebase UID is linked
      if (isDefinedAdmin) {
        user.role = 'admin';
      }
      user.lastLogin = new Date();
      if (name) user.name = name;
      if (photo) user.photo = photo;
      await user.save();
    }

    return sendSuccess(res, user, 'User synchronized successfully');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return sendSuccess(res, users, 'Users retrieved successfully');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['customer', 'admin'].includes(role)) {
      return sendError(res, 'Invalid role specified', 400);
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    if (!user) return sendError(res, 'User not found', 404);

    return sendSuccess(res, user, `User role updated to ${role}`);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const blockUnblockUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { status, blockedReason } = req.body;

    if (!['active', 'blocked'].includes(status)) {
      return sendError(res, 'Invalid user status specified', 400);
    }

    const user = await User.findById(userId);
    if (!user) return sendError(res, 'User not found', 404);

    user.status = status;
    if (status === 'blocked') {
      user.blockedReason = blockedReason || 'Account flagged by administrator.';
    } else {
      user.blockedReason = '';
    }

    await user.save();

    return sendSuccess(res, user, `User account ${status === 'blocked' ? 'blocked' : 'unblocked'}`);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};
