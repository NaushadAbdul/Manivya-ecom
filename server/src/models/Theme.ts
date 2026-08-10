import mongoose, { Schema, Document } from 'mongoose';

export interface ITheme extends Document {
  bgType: 'gradient' | 'image' | 'color';
  navbarBgType: 'gradient' | 'image' | 'color';
  bgColor: string;
  bgGradient: string;
  bgImage: string;
  navbarBgColor: string;
  navbarBgGradient: string;
  navbarBgImage: string;
  navbarTextColor: string;
  navbarAccentColor: string;
  textColor: string;
  presetId: string;
  createdAt: Date;
  updatedAt: Date;
}

const ThemeSchema: Schema = new Schema(
  {
    bgType: {
      type: String,
      enum: ['gradient', 'image', 'color'],
      default: 'gradient',
    },
    navbarBgType: {
      type: String,
      enum: ['gradient', 'image', 'color'],
      default: 'gradient',
    },
    bgColor: {
      type: String,
      default: '#1c0d06',
    },
    bgGradient: {
      type: String,
      default: 'linear-gradient(135deg, #1c0d06 0%, #3a1a0b 50%, #140803 100%)',
    },
    bgImage: {
      type: String,
      default: '',
    },
    navbarBgColor: {
      type: String,
      default: '#241108',
    },
    navbarBgGradient: {
      type: String,
      default: 'linear-gradient(90deg, #1c0d06 0%, #2d140a 50%, #140803 100%)',
    },
    navbarBgImage: {
      type: String,
      default: '',
    },
    navbarTextColor: {
      type: String,
      default: '#ffffff',
    },
    navbarAccentColor: {
      type: String,
      default: '#fbbf24',
    },
    textColor: {
      type: String,
      default: '#f8fafc',
    },
    presetId: {
      type: String,
      default: 'cosmic-amber',
    },
  },
  { timestamps: true }
);

export default mongoose.model<ITheme>('Theme', ThemeSchema);
