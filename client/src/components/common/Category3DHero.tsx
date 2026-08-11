import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ChevronRight, ShoppingBag, User as UserIcon, Check, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { Product } from '../../types';

export interface CategoryHeroItem {
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
  dummyProduct?: Product;
}

const DEFAULT_CATEGORY_ITEMS: CategoryHeroItem[] = [
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
  },
];

import { CategoryIntroModal } from './CategoryIntroModal';

export const Category3DHero: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CategoryHeroItem[]>(DEFAULT_CATEGORY_ITEMS);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isAdded, setIsAdded] = useState(false);

  // Category Intro Video Modal state
  const [introModalOpen, setIntroModalOpen] = useState(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('');
  const [selectedIntroVideo, setSelectedIntroVideo] = useState('');

  const { addToCart, totalItemsCount, toggleWishlist, isInWishlist } = useCart();
  const { user } = useAuth();

  const handleCategoryClick = (item: CategoryHeroItem) => {
    setSelectedCategoryName(item.name);
    setSelectedCategorySlug(item.slug || item.name);
    setSelectedIntroVideo(item.introVideo || '');
    setIntroModalOpen(true);
  };

  // Fetch dynamic 3D hero categories from backend
  useEffect(() => {
    apiService
      .getHero3D()
      .then((res) => {
        if (res.data && res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setItems(res.data.data);
        }
      })
      .catch((err) => {
        console.warn('Using default 3D category items fallback', err);
      });
  }, []);

  const currentItem = items[activeIndex] || items[0] || DEFAULT_CATEGORY_ITEMS[0];

  const getProductForCart = (item: CategoryHeroItem): Product => {
    return (
      item.dummyProduct || {
        _id: `hero-${item.id}`,
        name: item.title,
        slug: item.id,
        description: item.description,
        category: { _id: `cat-${item.id}`, name: item.name, slug: item.slug },
        brand: 'Manivya Enterprises',
        mrp: (item.priceValue || 10) * 1.25,
        sellingPrice: item.priceValue || 10,
        discount: 20,
        stock: 50,
        sku: `SKU-${item.id.toUpperCase()}`,
        tags: [item.name.toLowerCase()],
        featured: true,
        trending: true,
        specifications: { Category: item.name },
        images: [item.image],
        rating: 4.9,
        numReviews: 88,
        availability: 'in_stock',
      }
    );
  };

  const productForCart = getProductForCart(currentItem);
  const inWishlist = isInWishlist(productForCart._id);

  // Parallax tilt logic based on mouse movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    setMousePos({ x, y });
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % items.length);
    setIsAdded(false);
  };

  const handleAddToCart = () => {
    addToCart(productForCart, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const getCategoryColorPalette = (item: CategoryHeroItem) => {
    const solid = (item.bgSolid || '#ea580c').toLowerCase();
    const slugOrId = (item.id || item.slug || item.name || '').toLowerCase();

    if (slugOrId.includes('gelato') || slugOrId.includes('ice') || solid.includes('ea580c')) {
      return ['#ea580c', '#f97316', '#c2410c', '#9a3412', '#ea580c'];
    }
    if (slugOrId.includes('beverag') || slugOrId.includes('drink') || solid.includes('0284c7')) {
      return ['#0284c7', '#06b6d4', '#075985', '#0e7490', '#0284c7'];
    }
    if (slugOrId.includes('snack') || solid.includes('eab308')) {
      return ['#eab308', '#f59e0b', '#ca8a04', '#b45309', '#eab308'];
    }
    if (slugOrId.includes('choco') || solid.includes('451a03')) {
      return ['#451a03', '#7c2d12', '#3a1503', '#1e0a02', '#451a03'];
    }
    if (slugOrId.includes('dairy') || slugOrId.includes('milk')) {
      return ['#e2e8f0', '#38bdf8', '#cbd5e1', '#0284c7', '#e2e8f0'];
    }
    if (slugOrId.includes('fashion') || slugOrId.includes('cloth')) {
      return ['#6b7280', '#9ca3af', '#374151', '#1f2937', '#6b7280'];
    }
    if (slugOrId.includes('accessor') || slugOrId.includes('keychain')) {
      return ['#64748b', '#94a3b8', '#334155', '#1e293b', '#64748b'];
    }
    if (slugOrId.includes('note') || slugOrId.includes('journal') || slugOrId.includes('stationery')) {
      return ['#854d0e', '#a16207', '#713f12', '#451a03', '#854d0e'];
    }
    if (slugOrId.includes('coffee') || slugOrId.includes('cup') || slugOrId.includes('home')) {
      return ['#c2410c', '#ea580c', '#7c2d12', '#431407', '#c2410c'];
    }
    if (slugOrId.includes('face') || slugOrId.includes('wash') || slugOrId.includes('beauty') || slugOrId.includes('skincare')) {
      return ['#0d9488', '#14b8a6', '#0f766e', '#042f2e', '#0d9488'];
    }

    return [solid, `${solid}dd`, `${solid}99`, `${solid}55`, solid];
  };

  const colorPalette = getCategoryColorPalette(currentItem);

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-[92vh] w-full overflow-hidden flex flex-col justify-between select-none transition-all duration-1000"
      style={{
        background: currentItem.bgGradient || `radial-gradient(ellipse at 50% 40%, ${colorPalette[0]} 0%, ${colorPalette[2]} 70%, #080c14 100%)`,
      }}
    >
      {/* Dynamic Animated Base Gradient Overlay */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: currentItem.bgGradient || `radial-gradient(ellipse at 50% 40%, ${colorPalette[0]} 0%, ${colorPalette[2]} 70%, #080c14 100%)`,
          }}
        />
      </AnimatePresence>

      {/* Frequently Pulsing & Color Shifting Ambient Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        {/* Top-Left Pulsing Category Orb */}
        <motion.div
          key={`orb1-${currentItem.id}`}
          animate={{
            x: [mousePos.x * 40, mousePos.x * 40 + 25, mousePos.x * 40 - 20, mousePos.x * 40],
            y: [mousePos.y * 40, mousePos.y * 40 - 25, mousePos.y * 40 + 20, mousePos.y * 40],
            scale: [1, 1.25, 0.95, 1],
            backgroundColor: colorPalette,
          }}
          transition={{
            x: { type: 'spring', stiffness: 40, damping: 25 },
            y: { type: 'spring', stiffness: 40, damping: 25 },
            scale: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
            backgroundColor: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="absolute -top-36 -left-36 w-[700px] h-[700px] rounded-full blur-[150px] opacity-60 mix-blend-screen"
        />

        {/* Bottom-Right Complementary Pulsing Category Orb */}
        <motion.div
          key={`orb2-${currentItem.id}`}
          animate={{
            x: [-mousePos.x * 60, -mousePos.x * 60 - 35, -mousePos.x * 60],
            y: [-mousePos.y * 60, -mousePos.y * 60 + 35, -mousePos.y * 60],
            scale: [1, 1.3, 1],
            backgroundColor: [...colorPalette].reverse(),
          }}
          transition={{
            x: { type: 'spring', stiffness: 35, damping: 25 },
            y: { type: 'spring', stiffness: 35, damping: 25 },
            scale: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
            backgroundColor: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="absolute -bottom-36 -right-36 w-[800px] h-[800px] rounded-full blur-[160px] opacity-45 mix-blend-color-dodge"
        />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-30 w-full max-w-7xl mx-auto px-6 pt-6 pb-4 flex items-center justify-between border-b border-white/10">
        {/* Brand Name */}
        <Link to="/" className="flex items-center space-x-2 group">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-md font-serif">
            Manivya Mart
          </span>
        </Link>

        {/* Top Category Sub-Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-bold tracking-widest uppercase text-white/80">
          <button onClick={() => setActiveIndex(0)} className="hover:text-white transition-colors cursor-pointer">
            PRODUCE
          </button>
          <button onClick={() => setActiveIndex(2)} className="hover:text-white transition-colors cursor-pointer">
            BAKERY
          </button>
          <button onClick={() => setActiveIndex(0)} className="border-b-2 border-white pb-0.5 text-white font-extrabold cursor-pointer">
            GOURMET
          </button>
          <button onClick={() => setActiveIndex(1)} className="hover:text-white transition-colors cursor-pointer">
            CELLAR
          </button>
        </nav>

        {/* Right Header Actions */}
        <div className="flex items-center space-x-5 text-white">
          <Link to="/cart" className="relative p-1.5 hover:opacity-80 transition-opacity" title="Shopping Cart">
            <ShoppingBag className="w-5 h-5 drop-shadow" />
            {totalItemsCount > 0 && (
              <span className="absolute -top-1 -right-1.5 bg-white text-slate-900 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                {totalItemsCount}
              </span>
            )}
          </Link>

          <Link to={user ? "/profile" : "/auth"} className="p-1.5 hover:opacity-80 transition-opacity" title="Account">
            <UserIcon className="w-5 h-5 drop-shadow" />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="relative z-20 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
        
        {/* HUGE Dynamic Watermark Text in Background */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden z-0">
          <AnimatePresence mode="wait">
            <motion.h1
              key={currentItem.watermark}
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 0.14, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.15, y: -30 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-[18vw] sm:text-[14vw] font-black tracking-tighter uppercase select-none text-white whitespace-nowrap drop-shadow-2xl"
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                WebkitTextStroke: '2px rgba(255,255,255,0.4)',
              }}
            >
              {currentItem.watermark}
            </motion.h1>
          </AnimatePresence>
        </div>

        {/* TOP FOR MOBILE / CENTER FOR DESKTOP: 3D Floating Product Showcase */}
        <div className="relative z-20 w-full md:flex-1 flex flex-col justify-center items-center py-2 sm:py-4 order-1 md:order-2">
          {/* Mobile Only Header */}
          <div className="md:hidden text-center mb-3">
            <h3 className="text-xl font-black text-white tracking-tight drop-shadow-md">Product Gallery</h3>
            <span className="inline-block text-[11px] font-bold px-3 py-0.5 rounded-full bg-white/30 text-white border border-white/40 mt-1">
              {currentItem.name} Collection
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentItem.id}
              initial={{ opacity: 0, scale: 0.8, rotateY: -25, rotateZ: -5 }}
              animate={{ opacity: 1, scale: 1, rotateY: mousePos.x * 20 - 6, rotateX: -mousePos.y * 20 + 4, rotateZ: 3 }}
              exit={{ opacity: 0, scale: 0.85, rotateY: 25, rotateZ: 5 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative group cursor-pointer w-full max-w-sm sm:max-w-md flex justify-center"
              style={{
                perspective: '1200px',
                transformStyle: 'preserve-3d',
              }}
              onClick={() => handleCategoryClick(currentItem)}
              title={`Click to view all ${currentItem.name} products`}
            >
              {/* White Framed Floating Container with Perspective Shadow */}
              <div
                className="relative w-full bg-white rounded-3xl p-4 sm:p-6 shadow-[0_30px_70px_rgba(0,0,0,0.4)] border border-white/80 transition-transform duration-300 group-hover:scale-105"
                style={{
                  boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0,0,0,0.1)',
                }}
              >
                {/* Click overlay badge */}
                <div className="absolute top-3 left-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 shadow">
                  <span>Shop Category</span>
                  <ArrowRight className="w-3 h-3" />
                </div>

                {/* 3D Product Image */}
                <div className="w-full h-64 sm:h-72 flex items-center justify-center overflow-hidden rounded-2xl bg-slate-50/50 p-2">
                  <motion.img
                    animate={{
                      y: [0, -8, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    src={currentItem.image}
                    alt={currentItem.title}
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
                </div>

                {/* Floating Chevron Right Button attached to product frame */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute -right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white text-slate-800 shadow-2xl border border-slate-200 flex items-center justify-center transition-all duration-300 hover:scale-115 z-30"
                  title="Next Category Slide"
                >
                  <ChevronRight className="w-5 h-5 text-slate-700" />
                </button>
              </div>

              {/* Realistic Floor Shadow under 3D container */}
              <div
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-4/5 h-6 rounded-full bg-black/40 blur-xl pointer-events-none"
                style={{ transform: 'scaleY(0.4)' }}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* BOTTOM FOR MOBILE / LEFT FOR DESKTOP: Floating Glassmorphism Product Info Card */}
        <div className="relative z-20 w-full max-w-sm sm:max-w-md md:max-w-xs shrink-0 order-2 md:order-1">
          {/* Mobile Only Header */}
          <div className="md:hidden text-center mb-2">
            <h4 className="text-lg font-bold text-white tracking-wide">Product Information</h4>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentItem.id}
              initial={{ opacity: 0, x: -50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30, scale: 0.95 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl border border-white/40 text-slate-900 flex flex-col justify-between space-y-6"
              style={{
                background: currentItem.cardBg || 'rgba(255,255,255,0.5)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 30px rgba(255,255,255,0.2) inset',
              }}
            >
              <div className="space-y-3">
                <span
                  className="inline-block text-[10px] sm:text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full text-white shadow-sm"
                  style={{ background: currentItem.buttonBg || '#7c2d12' }}
                >
                  {currentItem.badge}
                </span>

                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug drop-shadow-sm" style={{ color: currentItem.textColor || '#0f172a' }}>
                  {currentItem.title}
                </h2>

                <p className="text-xs sm:text-sm leading-relaxed opacity-90 font-medium" style={{ color: currentItem.textColor || '#0f172a' }}>
                  {currentItem.description}
                </p>
              </div>

              {/* Action Row */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 text-white font-bold text-xs sm:text-sm py-3 px-5 rounded-full shadow-xl transition-all duration-300 transform active:scale-95 flex items-center justify-center space-x-2"
                    style={{
                      background: currentItem.buttonBg || '#7c2d12',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                    }}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Added!</span>
                      </>
                    ) : (
                      <span>Add to Cart - {currentItem.priceDisplay}</span>
                    )}
                  </button>

                  <button
                    onClick={() => toggleWishlist(productForCart)}
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 border shadow-lg ${
                      inWishlist
                        ? 'bg-rose-500 text-white border-rose-400 scale-110'
                        : 'bg-white/80 hover:bg-white text-slate-700 border-white/60'
                    }`}
                    title="Wishlist"
                  >
                    <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <button
                  onClick={() => handleCategoryClick(currentItem)}
                  className="w-full bg-white/70 hover:bg-white text-slate-900 text-xs font-bold py-2.5 px-4 rounded-2xl border border-white/80 transition-all flex items-center justify-center space-x-1.5 shadow-sm group"
                >
                  <span>Explore {currentItem.name} Products</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Side: Vertical Category Navigation Switcher */}
        <div className="relative z-20 hidden lg:flex flex-col items-end space-y-2.5 pl-4 max-h-[75vh] overflow-y-auto no-scrollbar">
          {items.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <div key={item.id} className="flex items-center space-x-2">
                {isActive && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCategoryClick(item);
                    }}
                    className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/80 hover:bg-white text-slate-900 shadow transition-all flex items-center space-x-1 shrink-0"
                    title={`Shop ${item.name}`}
                  >
                    <span>Shop</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                )}
                <button
                  onClick={() => {
                    if (isActive) {
                      handleCategoryClick(item);
                    } else {
                      setActiveIndex(index);
                      setIsAdded(false);
                    }
                  }}
                  className={`text-right text-sm sm:text-base font-bold tracking-wide transition-all duration-300 cursor-pointer flex items-center space-x-2 shrink-0 ${
                    isActive
                      ? 'text-slate-900 font-extrabold text-lg sm:text-xl scale-105'
                      : 'text-white/60 hover:text-white/90'
                  }`}
                  style={{
                    color: isActive ? currentItem.textColor || '#0f172a' : 'rgba(255,255,255,0.7)',
                    textShadow: isActive ? '0 2px 10px rgba(255,255,255,0.3)' : 'none',
                  }}
                >
                  <span>{item.name}</span>
                  {isActive && (
                    <motion.span
                      layoutId="activeCategoryDot"
                      className="w-2 h-2 rounded-full inline-block ml-2 shrink-0"
                      style={{ background: currentItem.buttonBg || '#7c2d12' }}
                    />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Horizontal Category Pills */}
      <div className="lg:hidden relative z-20 w-full px-4 pb-4 overflow-x-auto no-scrollbar flex items-center justify-start space-x-2">
        {items.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (isActive) {
                  handleCategoryClick(item);
                } else {
                  setActiveIndex(index);
                  setIsAdded(false);
                }
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 border ${
                isActive
                  ? 'bg-white text-slate-950 border-white shadow-lg scale-105'
                  : 'bg-black/30 text-white/80 border-white/20 hover:bg-black/50'
              }`}
            >
              {item.name}
            </button>
          );
        })}
      </div>

      {/* Category Intro Video Player Modal */}
      <CategoryIntroModal
        isOpen={introModalOpen}
        categoryName={selectedCategoryName}
        targetCategorySlug={selectedCategorySlug}
        introVideo={selectedIntroVideo}
        onClose={() => setIntroModalOpen(false)}
      />
    </div>
  );
};
