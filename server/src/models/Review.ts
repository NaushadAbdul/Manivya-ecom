import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  likes: mongoose.Types.ObjectId[];
  reports: number;
}

const ReviewSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    images: [{ type: String }],
    isVerifiedPurchase: { type: Boolean, default: false },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    reports: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IReview>('Review', ReviewSchema);
