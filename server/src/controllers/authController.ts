import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import User from '../models/User';
import LoginActivity from '../models/LoginActivity';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { NotificationService } from '../services/notificationService';
import { isDefinedAdminEmail } from '../utils/adminCheck';

const parseUserAgent = (ua: string = '') => {
  let browser = 'Chrome';
  let device = 'Desktop';
  let os = 'Windows';

  if (/mobile|android|iphone|ipad/i.test(ua)) {
    device = 'Mobile';
  }

  if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad/i.test(ua)) os = 'iOS';
  else if (/linux/i.test(ua)) os = 'Linux';
  else if (/windows/i.test(ua)) os = 'Windows';

  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';

  return { browser, device, os };
};

const getClientIp = (req: AuthRequest) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || '127.0.0.1';
};

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

    const ipAddress = getClientIp(req);
    const userAgentStr = (req.headers['user-agent'] as string) || '';
    const { browser, device, os } = parseUserAgent(userAgentStr);

    // 1. Primary lookup by Provider UID (Source of Truth)
    let user = await User.findOne({ uid });

    // 2. Secondary lookup by Email if UID not linked yet
    if (!user && normalizedEmail) {
      user = await User.findOne({ email: normalizedEmail });
    }

    const isDefinedAdmin = isDefinedAdminEmail(normalizedEmail);

    // If request originates from Admin Portal login, verify admin authorization
    if (isAdminPortal) {
      const isAuthorizedAdmin = isDefinedAdmin || (user && user.role === 'admin');
      if (!isAuthorizedAdmin) {
        return sendError(
          res,
          `Access Denied: The account (${normalizedEmail || uid}) does not have administrator privileges.`,
          403
        );
      }
    }

    if (!user) {
      const initialRole = isDefinedAdmin ? 'admin' : 'customer';
      user = await User.create({
        uid,
        name: name || normalizedEmail.split('@')[0] || 'Valued Customer',
        email: normalizedEmail,
        photo: photo || '',
        provider: provider || 'google',
        role: initialRole,
        loginCount: 1,
        lastLogin: new Date(),
        lastLoginIp: ipAddress,
        lastLoginDevice: device,
        lastLoginBrowser: browser,
        lastLoginOs: os,
        isOnline: true,
      });

      await NotificationService.sendNotification(
        user._id.toString(),
        'Welcome to MANIVYA Enterprises!',
        'Thank you for registering. Explore our premium AI-curated catalog and enjoy special welcoming perks.',
        'account'
      );
    } else {
      user.uid = uid; // Ensure Google UID is linked
      if (isDefinedAdmin && user.role !== 'admin') {
        user.role = 'admin';
      }
      user.lastLogin = new Date();
      user.loginCount = (user.loginCount || 0) + 1;
      user.lastLoginIp = ipAddress;
      user.lastLoginDevice = device;
      user.lastLoginBrowser = browser;
      user.lastLoginOs = os;
      user.isOnline = true;
      if (name) user.name = name;
      if (photo) user.photo = photo;
      await user.save();
    }

    // Mark previous active sessions as ended
    await LoginActivity.updateMany(
      { user: user._id, isCurrentSession: true },
      { isCurrentSession: false, logoutTime: new Date() }
    );

    // Record audit entry in LoginActivity collection
    await LoginActivity.create({
      user: user._id,
      uid: user.uid,
      name: user.name,
      email: user.email,
      provider: user.provider || provider || 'google',
      loginTime: new Date(),
      ipAddress,
      browser,
      device,
      os,
      isCurrentSession: true,
    });

    return sendSuccess(res, user, 'User synchronized successfully');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const logoutUser = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { isOnline: false });
      await LoginActivity.updateMany(
        { user: req.user._id, isCurrentSession: true },
        { isCurrentSession: false, logoutTime: new Date() }
      );
    }
    return sendSuccess(res, null, 'User logged out successfully');
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
