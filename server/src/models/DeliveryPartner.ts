import mongoose, { Schema, Document } from 'mongoose';

export interface IDeliveryPartner extends Document {
  partnerId: string;
  name: string;
  phone: string;
  vehicleType: 'Bike' | 'Van' | 'Truck';
  providerType: 'Internal' | 'Shiprocket' | 'Delhivery' | 'BlueDart' | 'DTDC' | 'IndiaPost' | 'AmazonShipping';
  availability: 'Available' | 'On Delivery' | 'Off Duty';
  assignedOrdersCount: number;
  rating: number;
  isActive: boolean;
}

const DeliveryPartnerSchema: Schema = new Schema(
  {
    partnerId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    vehicleType: { type: String, enum: ['Bike', 'Van', 'Truck'], default: 'Van' },
    providerType: {
      type: String,
      enum: ['Internal', 'Shiprocket', 'Delhivery', 'BlueDart', 'DTDC', 'IndiaPost', 'AmazonShipping'],
      default: 'Internal',
    },
    availability: {
      type: String,
      enum: ['Available', 'On Delivery', 'Off Duty'],
      default: 'Available',
    },
    assignedOrdersCount: { type: Number, default: 0 },
    rating: { type: Number, default: 4.8, min: 0, max: 5 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IDeliveryPartner>('DeliveryPartner', DeliveryPartnerSchema);
