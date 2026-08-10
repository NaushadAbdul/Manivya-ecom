import { Request, Response, NextFunction } from 'express';
import { verifyFirebaseToken } from '../config/firebase';
import User, { IUser } from '../models/User';
import LoginActivity from '../models/LoginActivity';
import { sendError } from '../utils/apiResponse';
import { isDefinedAdminEmail } from '../utils/adminCheck';

export interface AuthRequest extends Request {
  user?: IUser;
  firebaseUid?: string;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication token missing or invalid format', 401);
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await verifyFirebaseToken(token);

    const userEmail = decodedToken.email ? decodedToken.email.toLowerCase().trim() : '';
    let user = await User.findOne({
      $or: [
        { uid: decodedToken.uid },
        ...(userEmail ? [{ email: userEmail }] : []),
      ],
    });

    // Auto-create user record in MongoDB Atlas if first login, or link UID if existing by email
    if (!user) {
      user = await User.create({
        uid: decodedToken.uid,
        name: decodedToken.name || userEmail.split('@')[0] || 'Valued Customer',
        email: userEmail || `user_${decodedToken.uid.slice(0, 6)}@manivya.com`,
        photo: decodedToken.picture || '',
        provider: decodedToken.firebase?.sign_in_provider || 'password',
        role: isDefinedAdminEmail(userEmail) ? 'admin' : 'customer',
        status: 'active',
        loginCount: 1,
        lastLogin: new Date(),
      });
    } else {
      // Link Firebase UID if email matches
      if (user.uid !== decodedToken.uid) {
        user.uid = decodedToken.uid;
      }

      // Check if blocked
      if (user.status === 'blocked') {
        return sendError(res, `Forbidden: Your account has been blocked. Reason: ${user.blockedReason || 'Policy Violation'}`, 403);
      }

      if (isDefinedAdminEmail(user.email) && user.role !== 'admin') {
        user.role = 'admin';
      }

      user.lastLogin = new Date();
      user.loginCount = (user.loginCount || 1) + 1;
      await user.save();
    }

    // Record / Update Login Activity Audit Trail
    try {
      const userAgent = req.headers['user-agent'] || '';
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

      let browser = 'Chrome';
      if (userAgent.includes('Firefox')) browser = 'Firefox';
      else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
      else if (userAgent.includes('Edg')) browser = 'Edge';

      let os = 'Windows';
      if (userAgent.includes('Mac')) os = 'macOS';
      else if (userAgent.includes('Linux')) os = 'Linux';
      else if (userAgent.includes('Android')) os = 'Android';
      else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

      let device = 'Desktop';
      if (userAgent.includes('Mobi')) device = 'Mobile';
      else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) device = 'Tablet';

      await LoginActivity.create({
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
    } catch (actErr) {
      // Silent activity log fallback
    }

    req.user = user;
    req.firebaseUid = decodedToken.uid;
    next();
  } catch (error) {
    return sendError(res, `Authentication failed: ${(error as Error).message}`, 401);
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return sendError(res, 'Forbidden: Admin access required', 403);
  }
  next();
};

// Aliases for compatibility
export const protect = authenticate;
export const adminOnly = requireAdmin;
