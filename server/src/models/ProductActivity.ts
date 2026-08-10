import mongoose, { Schema, Document } from 'mongoose';

export interface IProductActivity extends Document {
  user?: mongoose.Types.ObjectId;
  userName?: string;
  userEmail?: string;
  product: mongoose.Types.ObjectId;
  productName: string;
  productImage?: string;
  action: 'view' | 'cart_add' | 'wishlist_add' | 'purchase';
  timestamp: Date;
}

const ProductActivitySchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String, default: 'Guest Visitor' },
    userEmail: { type: String, default: '' },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    productImage: { type: String, default: '' },
    action: {
      type: String,
      enum: ['view', 'cart_add', 'wishlist_add', 'purchase'],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ProductActivitySchema.index({ createdAt: -1 });

export default mongoose.model<IProductActivity>('ProductActivity', ProductActivitySchema);
