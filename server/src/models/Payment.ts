import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  order: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  paymentMethod: 'qr_code' | 'cod' | 'razorpay' | 'stripe';
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  proofImage?: string;
  transactionId?: string;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  rejectionReason?: string;
}

const PaymentSchema: Schema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    paymentMethod: { type: String, enum: ['qr_code', 'cod', 'razorpay', 'stripe'], required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending', index: true },
    proofImage: { type: String, default: '' },
    transactionId: { type: String, default: '' },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    rejectionReason: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<IPayment>('Payment', PaymentSchema);
