import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Sparkles, Flame, Award } from 'lucide-react';
import { ProductGrid } from '../components/product/ProductGrid';
import { apiService } from '../services/api';
import { Product, Category } from '../types';
import { CategoryIntroModal } from '../components/common/CategoryIntroModal';
import { Category3DHero } from '../components/common/Category3DHero';
import { ShopCatalogSection } from '../components/shop/ShopCatalogSection';

const getCategoryGlowColor = (catNameOrSlug: string) => {
  const s = (catNameOrSlug || '').toLowerCase();
  if (s.includes('ice') || s.includes('gelato')) return 'rgba(234, 88, 12, 0.55)';
  if (s.includes('beverag') || s.includes('drink')) return 'rgba(2, 132, 199, 0.55)';
  if (s.includes('snack')) return 'rgba(234, 179, 8, 0.55)';
  if (s.includes('choco')) return 'rgba(124, 45, 18, 0.65)';
  if (s.includes('dairy') || s.includes('milk')) return 'rgba(56, 189, 248, 0.55)';
  if (s.includes('fashion') || s.includes('cloth')) return 'rgba(156, 163, 175, 0.55)';
  if (s.includes('accessor') || s.includes('keychain')) return 'rgba(100, 116, 139, 0.55)';
  if (s.includes('note') || s.includes('stationery') || s.includes('journal')) return 'rgba(133, 77, 14, 0.55)';
  if (s.includes('coffee') || s.includes('cup')) return 'rgba(194, 65, 12, 0.55)';
  if (s.includes('face') || s.includes('wash') || s.includes('beauty')) return 'rgba(13, 148, 136, 0.55)';
  return 'rgba(99, 102, 241, 0.5)';
};

export const HomePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Category for Embedded Catalog Section
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState(searchParams.get('category') || '');

  // Universal Category Intro Video Overlay State
  const [categoryIntroOpen, setCategoryIntroOpen] = useState(false);
  const [selectedCatName, setSelectedCatName] = useState('');
  const [selectedCatSlug, setSelectedCatSlug] = useState('');
  const [selectedCatVideo, setSelectedCatVideo] = useState('');

  const handleExploreCategory = (slug: string) => {
    setSelectedCatalogCategory(slug);
    setTimeout(() => {
      document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleCategoryCardClick = (e: React.MouseEvent, cat: Category) => {
    e.preventDefault();
    handleExploreCategory(cat.slug);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [featRes, trendRes, aiRes, catRes] = await Promise.all([
          apiService.getProducts({ featured: true, limit: 4 }),
          apiService.getProducts({ trending: true, limit: 4 }),
          apiService.getPersonalizedRecommendations(4),
          apiService.getCategories(),
        ]);

        if (featRes.data.success) setFeaturedProducts(featRes.data.data);
        if (trendRes.data.success) setTrendingProducts(trendRes.data.data);
        if (aiRes.data.success) setAiRecommendations(aiRes.data.data);
        if (catRes.data.success) setCategories(catRes.data.data);
      } catch (err) {
        console.error('Error fetching homepage data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Listen for scroll to catalog event
  useEffect(() => {
    const handleScrollToCatalog = (e: any) => {
      if (e.detail && e.detail.category) {
        setSelectedCatalogCategory(e.detail.category);
      }
      setTimeout(() => {
        document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    };

    window.addEventListener('scrollToCatalog', handleScrollToCatalog);
    return () => window.removeEventListener('scrollToCatalog', handleScrollToCatalog);
  }, []);

  const scrollToCatalog = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-16 pb-16">
      {/* 3D Interactive Category Hero Section */}
      <section className="-mt-4">
        <Category3DHero onExploreCategory={handleExploreCategory} />
      </section>

      {/* Categories Auto-Slide Glassmorphism Marquee */}
      <section className="space-y-6 py-2">
        {/* CSS keyframe for the slide animation */}
        <style>{`
          @keyframes marquee-slide {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .marquee-track {
            display: flex;
            width: max-content;
            animation: marquee-slide 28s linear infinite;
          }
          .marquee-track:hover {
            animation-play-state: paused;
          }
        `}</style>

        <div className="max-w-7xl mx-auto px-4 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Browse by Category</h2>
            <p className="text-xs text-slate-400 mt-1">Explore our wide selection of premium curated collections</p>
          </div>
          <button onClick={scrollToCatalog} className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Outer Glassmorphism Container with fade masks */}
        <div className="relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.07) 0%, rgba(139,92,246,0.04) 50%, rgba(99,102,241,0.07) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            padding: '28px 0',
          }}
        >
          {/* Left fade mask */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-28 z-10"
            style={{ background: 'linear-gradient(to right, #0B0F17 0%, transparent 100%)' }} />
          {/* Right fade mask */}
          <div className="pointer-events-none absolute right-0 top-0 h-full w-28 z-10"
            style={{ background: 'linear-gradient(to left, #0B0F17 0%, transparent 100%)' }} />
          {categories.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No categories configured. Add categories in Admin Dashboard → Categories.
            </div>
          ) : categories.length <= 4 ? (
            <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-6">
              {categories.map((cat) => {
                const glowColor = getCategoryGlowColor(cat.slug || cat.name);
                return (
                  <button
                    key={cat._id}
                    onClick={(e) => handleCategoryCardClick(e, cat)}
                    className="group relative w-60 sm:w-72 h-44 rounded-3xl overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(99,102,241,0.25)] border border-white/10 hover:border-indigo-500/50 text-left cursor-pointer"
                    style={{
                      background: 'rgba(15, 12, 30, 0.65)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                    }}
                  >
                    {/* Glowing background pulsar matching category color */}
                    <div
                      className="absolute -inset-10 opacity-20 group-hover:opacity-90 transition-opacity duration-700 pointer-events-none rounded-3xl"
                      style={{
                        background: `radial-gradient(circle at 50% 50%, ${glowColor} 0%, rgba(139,92,246,0.1) 65%, transparent 100%)`,
                      }}
                    />

                    {/* Image with smooth zoom and subtle rotation */}
                    <img
                      src={cat.image || ''}
                      alt={cat.name}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-85 group-hover:scale-110 group-hover:rotate-1 transition-all duration-700 ease-out"
                    />

                    {/* Glass overlay gradient */}
                    <div
                      className="absolute inset-0 transition-opacity duration-500"
                      style={{
                        background: 'linear-gradient(to top, rgba(5,2,15,0.95) 0%, rgba(5,2,15,0.4) 55%, rgba(255,255,255,0.05) 100%)',
                      }}
                    />

                    {/* Shimmer light sweep beam */}
                    <div className="category-card-shimmer z-10" />

                    {/* Floating Explore arrow badge */}
                    <div className="absolute top-3.5 right-3.5 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 translate-x-2">
                      <span className="bg-indigo-600/90 text-white font-bold text-[10px] px-2.5 py-1 rounded-full backdrop-blur-md shadow-lg shadow-indigo-500/30 flex items-center gap-1">
                        Explore <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>

                    {/* Category text overlay */}
                    <div className="absolute bottom-4 left-4 right-4 z-20 transform group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-base font-extrabold text-white group-hover:text-indigo-300 transition-colors drop-shadow-md truncate">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors line-clamp-1 mt-0.5">
                        {cat.description || 'Explore curated collection'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="marquee-track gap-6 px-4">
              {[...categories, ...categories].map((cat, idx) => {
                const glowColor = getCategoryGlowColor(cat.slug || cat.name);
                return (
                  <button
                    key={`${cat._id}-${idx}`}
                    onClick={(e) => handleCategoryCardClick(e, cat)}
                    className="group relative shrink-0 w-60 h-44 rounded-3xl overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(99,102,241,0.25)] mx-2 border border-white/10 hover:border-indigo-500/50 text-left cursor-pointer"
                    style={{
                      background: 'rgba(15, 12, 30, 0.65)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                    }}
                  >
                    {/* Glowing background pulsar matching category color */}
                    <div
                      className="absolute -inset-10 opacity-20 group-hover:opacity-90 transition-opacity duration-700 pointer-events-none rounded-3xl"
                      style={{
                        background: `radial-gradient(circle at 50% 50%, ${glowColor} 0%, rgba(139,92,246,0.1) 65%, transparent 100%)`,
                      }}
                    />

                    {/* Image with smooth zoom and subtle rotation */}
                    <img
                      src={cat.image || ''}
                      alt={cat.name}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-85 group-hover:scale-110 group-hover:rotate-1 transition-all duration-700 ease-out"
                    />

                    {/* Glass overlay gradient */}
                    <div
                      className="absolute inset-0 transition-opacity duration-500"
                      style={{
                        background: 'linear-gradient(to top, rgba(5,2,15,0.95) 0%, rgba(5,2,15,0.4) 55%, rgba(255,255,255,0.05) 100%)',
                      }}
                    />

                    {/* Shimmer light sweep beam */}
                    <div className="category-card-shimmer z-10" />

                    {/* Floating Explore arrow badge */}
                    <div className="absolute top-3.5 right-3.5 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 translate-x-2">
                      <span className="bg-indigo-600/90 text-white font-bold text-[10px] px-2.5 py-1 rounded-full backdrop-blur-md shadow-lg shadow-indigo-500/30 flex items-center gap-1">
                        Explore <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>

                    {/* Category text overlay */}
                    <div className="absolute bottom-4 left-4 right-4 z-20 transform group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-base font-extrabold text-white group-hover:text-indigo-300 transition-colors drop-shadow-md truncate">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors line-clamp-1 mt-0.5">
                        {cat.description || 'Explore curated collection'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* AI Recommendation Section */}
      <section id="ai-recommendations" className="max-w-7xl mx-auto px-4 space-y-6 pt-4">
        <div className="bg-gradient-to-r from-indigo-900/30 via-slate-900 to-purple-900/30 border border-indigo-500/30 p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  AI Recommendation Engine
                </h2>
                <p className="text-xs text-slate-400">Personalized product selections powered by machine learning algorithms</p>
              </div>
            </div>
          </div>

          <ProductGrid products={aiRecommendations} loading={loading} />
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-indigo-400" /> Featured Flagship Store
            </h2>
            <p className="text-xs text-slate-400 mt-1">Handpicked premium products with top rating performance</p>
          </div>
          <button onClick={scrollToCatalog} className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer">
            See More
          </button>
        </div>

        <ProductGrid products={featuredProducts} loading={loading} />
      </section>

      {/* Trending Hot Sales */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Flame className="w-6 h-6 text-rose-500" /> Trending Right Now
            </h2>
            <p className="text-xs text-slate-400 mt-1">Most ordered & searched items this week</p>
          </div>
          <button onClick={scrollToCatalog} className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer">
            View All
          </button>
        </div>

        <ProductGrid products={trendingProducts} loading={loading} />
      </section>

      {/* Exact Catalog & Products Section Embedded Directly Below Trending Right Now */}
      <ShopCatalogSection
        initialCategory={selectedCatalogCategory}
        onCategoryChange={(cat) => setSelectedCatalogCategory(cat)}
      />

      {/* Category Fullscreen Intro Video Overlay */}
      <CategoryIntroModal
        isOpen={categoryIntroOpen}
        categoryName={selectedCatName}
        targetCategorySlug={selectedCatSlug}
        introVideo={selectedCatVideo}
        onClose={() => setCategoryIntroOpen(false)}
      />
    </div>
  );
};
