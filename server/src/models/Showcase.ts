import mongoose, { Schema, Document } from 'mongoose';

export interface IShowcaseSlide {
  src: string;
  label: string;
  name: string;
  price: string;
  original: string;
  linkUrl: string;
}

export interface IShowcase extends Document {
  slides: IShowcaseSlide[];
  updatedBy?: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const ShowcaseSlideSchema = new Schema<IShowcaseSlide>({
  src: { type: String, required: true },
  label: { type: String, default: 'Featured' },
  name: { type: String, default: 'Product Name' },
  price: { type: String, default: '₹0' },
  original: { type: String, default: '' },
  linkUrl: { type: String, default: '/shop' },
});

const ShowcaseSchema = new Schema<IShowcase>(
  {
    slides: { type: [ShowcaseSlideSchema], default: [] },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const Showcase = mongoose.model<IShowcase>('Showcase', ShowcaseSchema);
export default Showcase;
