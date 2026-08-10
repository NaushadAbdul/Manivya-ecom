import Notification from '../models/Notification';

export class NotificationService {
  static async sendNotification(
    userId: string,
    title: string,
    message: string,
    type: 'order' | 'payment' | 'account' | 'promo' | 'system' = 'system',
    link?: string
  ) {
    try {
      const notification = await Notification.create({
        user: userId,
        title,
        message,
        type,
        link: link || '',
      });
      console.log(`[Notification Sent] User: ${userId} | ${title}`);
      return notification;
    } catch (err) {
      console.error('[Notification Error]', err);
    }
  }
}
