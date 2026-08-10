import mongoose, { Schema, Document } from 'mongoose';

export interface IWarehouse extends Document {
  name: string;
  code: string;
  fullAddress: string;
  area: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  managerName: string;
  managerPhone: string;
  supportedRadiusKm: number;
  isActive: boolean;
}

const WarehouseSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    fullAddress: { type: String, required: true },
    area: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'India' },
    postalCode: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    managerName: { type: String, required: true },
    managerPhone: { type: String, required: true },
    supportedRadiusKm: { type: Number, default: 500 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IWarehouse>('Warehouse', WarehouseSchema);
