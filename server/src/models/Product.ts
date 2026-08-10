import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  category: mongoose.Types.ObjectId;
  brand: string;
  mrp: number;
  sellingPrice: number;
  discount: number;
  stock: number;
  sku: string;
  tags: string[];
  featured: boolean;
  trending: boolean;
  specifications: Record<string, string>;
  weight?: string;
  images: string[];
  rating: number;
  numReviews: number;
  availability: 'in_stock' | 'out_of_stock' | 'discontinued';
  isDeleted: boolean;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    brand: { type: String, required: true, trim: true, index: true },
    mrp: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, required: true, unique: true, uppercase: true },
    tags: [{ type: String, trim: true }],
    featured: { type: Boolean, default: false, index: true },
    trending: { type: Boolean, default: false, index: true },
    specifications: { type: Map, of: String, default: {} },
    weight: { type: String, default: '' },
    images: [{ type: String, required: true }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    availability: {
      type: String,
      enum: ['in_stock', 'out_of_stock', 'discontinued'],
      default: 'in_stock',
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
ProductSchema.index({ isDeleted: 1, availability: 1, stock: 1 });
ProductSchema.index({ isDeleted: 1, createdAt: -1 });
ProductSchema.index({ category: 1, isDeleted: 1 });

export default mongoose.model<IProduct>('Product', ProductSchema);

