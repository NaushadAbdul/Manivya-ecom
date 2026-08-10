import mongoose, { Schema, Document } from 'mongoose';

export interface IAddress extends Document {
  user: mongoose.Types.ObjectId;
  type: 'Home' | 'Office' | 'Other' | 'Current';
  name: string;
  phone: string;
  fullAddress: string;
  area: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

const AddressSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['Home', 'Office', 'Other', 'Current'], default: 'Home' },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    fullAddress: { type: String, required: true },
    area: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'India' },
    postalCode: { type: String, required: true },
    latitude: { type: Number },
    longitude: { type: Number },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IAddress>('Address', AddressSchema);
