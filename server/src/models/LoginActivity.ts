import mongoose, { Schema, Document } from 'mongoose';

export interface ILoginActivity extends Document {
  user: mongoose.Types.ObjectId;
  uid: string;
  name: string;
  email: string;
  provider: string;
  loginTime: Date;
  logoutTime?: Date;
  ipAddress: string;
  browser: string;
  device: string;
  os: string;
  city?: string;
  state?: string;
  country?: string;
  isCurrentSession: boolean;
}

const LoginActivitySchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    uid: { type: String, required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    provider: { type: String, default: 'password' },
    loginTime: { type: Date, default: Date.now },
    logoutTime: { type: Date },
    ipAddress: { type: String, default: '127.0.0.1' },
    browser: { type: String, default: 'Chrome' },
    device: { type: String, default: 'Desktop' },
    os: { type: String, default: 'Windows' },
    city: { type: String, default: 'Visakhapatnam' },
    state: { type: String, default: 'Andhra Pradesh' },
    country: { type: String, default: 'India' },
    isCurrentSession: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ILoginActivity>('LoginActivity', LoginActivitySchema);
