import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
  date: string; // YYYY-MM-DD
  totalSales: number;
  totalOrders: number;
  newCustomers: number;
  pageViews: number;
  topCategories: { category: string; count: number }[];
}

const AnalyticsSchema: Schema = new Schema(
  {
    date: { type: String, required: true, unique: true, index: true },
    totalSales: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    newCustomers: { type: Number, default: 0 },
    pageViews: { type: Number, default: 0 },
    topCategories: [
      {
        category: { type: String },
        count: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
