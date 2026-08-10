import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  photo?: string;
  provider: string;
  role: 'customer' | 'admin';
  status: 'active' | 'blocked';
  blockedReason?: string;
  loginCount: number;
  totalSpent: number;
  createdAt: Date;
  lastLogin: Date;
}

const UserSchema: Schema = new Schema(
  {
    uid: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    photo: { type: String, default: '' },
    provider: { type: String, default: 'password' },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    status: { type: String, enum: ['active', 'blocked'], default: 'active' },
    blockedReason: { type: String, default: '' },
    loginCount: { type: Number, default: 1 },
    totalSpent: { type: Number, default: 0 },
    lastLogin: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Compound indexes for customer analytics performance
UserSchema.index({ role: 1, createdAt: -1 });
UserSchema.index({ role: 1, totalSpent: -1 });

export default mongoose.model<IUser>('User', UserSchema);

