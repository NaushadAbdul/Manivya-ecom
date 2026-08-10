import mongoose, { Schema, Document } from 'mongoose';

export interface IHero3DCategory extends Document {
  id: string;
  name: string;
  watermark: string;
  badge: string;
  title: string;
  description: string;
  priceDisplay: string;
  priceValue: number;
  bgGradient: string;
  bgSolid: string;
  cardBg: string;
  badgeColor: string;
  textColor: string;
  buttonBg: string;
  image: string;
  introVideo?: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const Hero3DCategorySchema = new Schema<IHero3DCategory>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    watermark: { type: String, required: true },
    badge: { type: String, default: 'NEW' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    priceDisplay: { type: String, default: '$12.00' },
    priceValue: { type: Number, default: 12.00 },
    bgGradient: { type: String, required: true },
    bgSolid: { type: String, required: true },
    cardBg: { type: String, default: 'rgba(255,255,255,0.5)' },
    badgeColor: { type: String, default: '#7c2d12' },
    textColor: { type: String, default: '#0f172a' },
    buttonBg: { type: String, default: '#7c2d12' },
    image: { type: String, required: true },
    introVideo: { type: String, default: '' },
    slug: { type: String, required: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Hero3DCategory = mongoose.model<IHero3DCategory>('Hero3DCategory', Hero3DCategorySchema);
export default Hero3DCategory;
