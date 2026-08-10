import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'account' | 'promo' | 'system';
  read: boolean;
  link?: string;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['order', 'payment', 'account', 'promo', 'system'], default: 'system' },
    read: { type: Boolean, default: false },
    link: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>('Notification', NotificationSchema);
