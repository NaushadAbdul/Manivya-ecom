import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Hero3DCategory from '../models/Hero3DCategory';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const DEFAULT_HERO_3D_ITEMS = [
  {
    id: 'gelato',
    name: 'Gelato',
    watermark: 'GELATO',
    badge: 'NEW ARRIVAL',
    title: 'Orange & Saffron',
    description: 'Experience the rich, velvety texture of artisanal gelato, infused with sun-ripened oranges and delicate saffron threads.',
    priceDisplay: '$12.00',
    priceValue: 12.00,
    bgGradient: 'radial-gradient(ellipse at 50% 40%, #ea580c 0%, #c2410c 35%, #9a3412 70%, #431407 100%)',
    bgSolid: '#ea580c',
    cardBg: 'rgba(255, 237, 213, 0.45)',
    badgeColor: '#9a3412',
    textColor: '#431407',
    buttonBg: '#6c280f',
    image: '/images/3d-categories/gelato.png',
    slug: 'ice-creams',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'beverages',
    name: 'Beverages',
    watermark: 'DRINKS',
    badge: 'LIMITED',
    title: 'Aqua Vita Cold',
    description: 'Refresh yourself with our ultra-filtered spring water, delicately infused with crisp cucumber and mint.',
    priceDisplay: '$8.50',
    priceValue: 8.50,
    bgGradient: 'radial-gradient(ellipse at 50% 40%, #0284c7 0%, #0369a1 35%, #075985 70%, #0c4a6e 100%)',
    bgSolid: '#0284c7',
    cardBg: 'rgba(186, 230, 253, 0.45)',
    badgeColor: '#0369a1',
    textColor: '#0c4a6e',
    buttonBg: '#075985',
    image: '/images/3d-categories/beverages.png',
    slug: 'beverages',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'snacks',
    name: 'Snacks',
    watermark: 'SNACK',
    badge: 'BESTSELLER',
    title: 'Golden Harvest',
    description: 'Artisanal potato chips hand-cooked in small batches, seasoned with roasted garlic and fine herbs.',
    priceDisplay: '$6.00',
    priceValue: 6.00,
    bgGradient: 'radial-gradient(ellipse at 50% 40%, #eab308 0%, #ca8a04 35%, #a16207 70%, #713f12 100%)',
    bgSolid: '#eab308',
    cardBg: 'rgba(254, 240, 138, 0.5)',
    badgeColor: '#854d0e',
    textColor: '#713f12',
    buttonBg: '#6b390b',
    image: '/images/3d-categories/snacks.png',
    slug: 'snacks',
    sortOrder: 3,
    isActive: true,
  },
  {
    id: 'chocolates',
    name: 'Chocolates',
    watermark: 'CHOCOLATE',
    badge: 'PREMIUM',
    title: 'Aurum Dark',
    description: 'Indulge in 85% single-origin dark chocolate, featuring notes of dark cherry, espresso, and toasted almond.',
    priceDisplay: '$14.00',
    priceValue: 14.00,
    bgGradient: 'radial-gradient(ellipse at 50% 40%, #451a03 0%, #3a1503 35%, #270e02 70%, #170701 100%)',
    bgSolid: '#451a03',
    cardBg: 'rgba(215, 204, 200, 0.35)',
    badgeColor: '#9a3412',
    textColor: '#fef3c7',
    buttonBg: '#7c2d12',
    image: '/images/3d-categories/chocolates.png',
    slug: 'chocolates',
    sortOrder: 4,
    isActive: true,
  },
  {
    id: 'dairy',
    name: 'Dairy',
    watermark: 'MILK',
    badge: 'FRESH',
    title: 'Pure Pastures Milk',
    description: 'Farm-fresh, cold-pressed whole milk sourced directly from local, grass-fed cows. Creamy, rich, and untouched.',
    priceDisplay: '$5.50',
    priceValue: 5.50,
    bgGradient: 'radial-gradient(ellipse at 50% 40%, #e2e8f0 0%, #cbd5e1 35%, #94a3b8 70%, #64748b 100%)',
    bgSolid: '#e2e8f0',
    cardBg: 'rgba(255, 255, 255, 0.75)',
    badgeColor: '#475569',
    textColor: '#1e293b',
    buttonBg: '#7c2d12',
    image: '/images/3d-categories/dairy.png',
    slug: 'dairy',
    sortOrder: 5,
    isActive: true,
  },
  {
    id: 'fashion',
    name: 'Fashion',
    watermark: 'STYLE',
    badge: 'ESSENTIAL',
    title: 'Minimalist Essentials',
    description: 'Premium organic cotton construction with a tailored fit. Designed for ultimate comfort and timeless appeal.',
    priceDisplay: '$45.00',
    priceValue: 45.00,
    bgGradient: 'radial-gradient(ellipse at 50% 40%, #d1d5db 0%, #9ca3af 35%, #4b5563 70%, #1f2937 100%)',
    bgSolid: '#9ca3af',
    cardBg: 'rgba(243, 244, 246, 0.65)',
    badgeColor: '#374151',
    textColor: '#111827',
    buttonBg: '#6b390b',
    image: '/images/3d-categories/fashion.png',
    slug: 'fashion',
    sortOrder: 6,
    isActive: true,
  },
  {
    id: 'accessories',
    name: 'Accessories',
    watermark: 'SILVER',
    badge: 'DESIGNER',
    title: 'Signature Keychain',
    description: 'Machined from aircraft-grade aluminum with braided leather accents. Elevate your everyday carry.',
    priceDisplay: '$28.00',
    priceValue: 28.00,
    bgGradient: 'radial-gradient(ellipse at 50% 40%, #64748b 0%, #475569 35%, #334155 70%, #0f172a 100%)',
    bgSolid: '#64748b',
    cardBg: 'rgba(241, 245, 249, 0.6)',
    badgeColor: '#334155',
    textColor: '#0f172a',
    buttonBg: '#6b390b',
    image: '/images/3d-categories/keychain.png',
    slug: 'accessories',
    sortOrder: 7,
    isActive: true,
  },
  {
    id: 'notebooks',
    name: 'Notebooks',
    watermark: 'JOURNAL',
    badge: 'HANDCRAFTED',
    title: 'Artisanal Leather Journal',
    description: 'Bound in full-grain vegetable-tanned leather with 240 pages of 120gsm fountain-pen friendly acid-free paper.',
    priceDisplay: '$22.00',
    priceValue: 22.00,
    bgGradient: 'radial-gradient(ellipse at 50% 40%, #854d0e 0%, #713f12 35%, #542d08 70%, #2e1605 100%)',
    bgSolid: '#854d0e',
    cardBg: 'rgba(254, 243, 199, 0.55)',
    badgeColor: '#713f12',
    textColor: '#451a03',
    buttonBg: '#542d08',
    image: '/images/3d-categories/notebook.png',
    slug: 'stationery',
    sortOrder: 8,
    isActive: true,
  },
  {
    id: 'coffeecups',
    name: 'Coffee Cups',
    watermark: 'COFFEE',
    badge: 'CERAMIC',
    title: 'Artisanal Terracotta Mug',
    description: 'Hand-thrown stoneware mug coated in double reactive glaze. Retains heat perfectly for your morning espresso or brew.',
    priceDisplay: '$16.50',
    priceValue: 16.50,
    bgGradient: 'radial-gradient(ellipse at 50% 40%, #c2410c 0%, #9a3412 35%, #7c2d12 70%, #431407 100%)',
    bgSolid: '#c2410c',
    cardBg: 'rgba(255, 237, 213, 0.5)',
    badgeColor: '#7c2d12',
    textColor: '#431407',
    buttonBg: '#6c280f',
    image: '/images/3d-categories/coffeecup.png',
    slug: 'home-kitchen',
    sortOrder: 9,
    isActive: true,
  },
  {
    id: 'facewash',
    name: 'Face Wash',
    watermark: 'SKINCARE',
    badge: 'BOTANICAL',
    title: 'Hydrating Botanical Cleanser',
    description: 'Sulfate-free foaming cleanser enriched with organic aloe vera, green tea extract, and hyaluronic acid for glowing skin.',
    priceDisplay: '$19.00',
    priceValue: 19.00,
    bgGradient: 'radial-gradient(ellipse at 50% 40%, #0d9488 0%, #0f766e 35%, #115e59 70%, #042f2e 100%)',
    bgSolid: '#0d9488',
    cardBg: 'rgba(204, 251, 241, 0.55)',
    badgeColor: '#0f766e',
    textColor: '#042f2e',
    buttonBg: '#115e59',
    image: '/images/3d-categories/facewash.png',
    slug: 'beauty',
    sortOrder: 10,
    isActive: true,
  },
];

// GET /api/hero-3d (Public)
export const getHero3DCategories = async (_req: AuthRequest, res: Response) => {
  try {
    let items = await Hero3DCategory.find({ isActive: true }).sort({ sortOrder: 1 });
    if (!items || items.length === 0) {
      // Seed default items into DB if empty
      await Hero3DCategory.insertMany(DEFAULT_HERO_3D_ITEMS);
      items = await Hero3DCategory.find({ isActive: true }).sort({ sortOrder: 1 });
    }
    return sendSuccess(res, items, '3D Hero categories retrieved');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

// GET /api/hero-3d/admin (Admin - includes inactive)
export const getAllHero3DCategoriesAdmin = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return sendError(res, 'Admin access required', 403);
    }
    let items = await Hero3DCategory.find({}).sort({ sortOrder: 1 });
    if (!items || items.length === 0) {
      await Hero3DCategory.insertMany(DEFAULT_HERO_3D_ITEMS);
      items = await Hero3DCategory.find({}).sort({ sortOrder: 1 });
    }
    return sendSuccess(res, items, 'All 3D Hero categories retrieved for Admin');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

// POST /api/hero-3d (Admin Create)
export const createHero3DCategory = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return sendError(res, 'Admin access required', 403);
    }
    const itemData = req.body;
    if (!itemData.name || !itemData.title || !itemData.image) {
      return sendError(res, 'Name, title, and image are required', 400);
    }
    const id = itemData.id || itemData.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const existing = await Hero3DCategory.findOne({ id });
    if (existing) {
      return sendError(res, 'Item with this identifier already exists', 400);
    }

    const newItem = new Hero3DCategory({
      ...itemData,
      id,
    });
    await newItem.save();
    return sendSuccess(res, newItem, '3D Hero category created successfully', 211);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

// PUT /api/hero-3d/:id (Admin Edit)
export const updateHero3DCategory = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return sendError(res, 'Admin access required', 403);
    }
    const { id } = req.params;
    const item = await Hero3DCategory.findOne({ id });
    if (!item) {
      return sendError(res, '3D Hero category not found', 404);
    }

    Object.assign(item, req.body);
    await item.save();
    return sendSuccess(res, item, '3D Hero category updated successfully');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

// DELETE /api/hero-3d/:id (Admin Delete)
export const deleteHero3DCategory = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return sendError(res, 'Admin access required', 403);
    }
    const { id } = req.params;
    const deleted = await Hero3DCategory.findOneAndDelete({ id });
    if (!deleted) {
      return sendError(res, '3D Hero category not found', 404);
    }
    return sendSuccess(res, deleted, '3D Hero category deleted successfully');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};
