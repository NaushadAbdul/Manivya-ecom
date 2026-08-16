import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, Star, RefreshCw } from 'lucide-react';
import { ProductGrid } from '../product/ProductGrid';
import { apiService } from '../../services/api';
import { Product, Category } from '../../types';
import { IceCreamIntroModal, isIceCreamCategory } from '../common/IceCreamIntroModal';

interface ShopCatalogSectionProps {
  initialCategory?: string;
  initialSearch?: string;
  onCategoryChange?: (categorySlug: string) => void;
}

export const ShopCatalogSection: React.FC<ShopCatalogSectionProps> = ({
  initialCategory = '',
  initialSearch = '',
  onCategoryChange,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || searchParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState(initialSearch || searchParams.get('search') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortOption, setSortOption] = useState(searchParams.get('sort') || 'newest');
  const [ratingFilter, setRatingFilter] = useState(searchParams.get('rating') || '');
  const [availability, setAvailability] = useState(searchParams.get('availability') || '');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Ice Cream Intro State
  const [iceCreamIntroOpen, setIceCreamIntroOpen] = useState(false);
  const [targetIceCreamSlug, setTargetIceCreamSlug] = useState('amul-ice-creams');

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    if (initialSearch) {
      setSearchQuery(initialSearch);
    }
  }, [initialSearch]);

  const handleCategorySelect = (catSlug: string, catObj?: Category) => {
    if (catSlug && isIceCreamCategory(catObj || catSlug) && selectedCategory !== catSlug) {
      setTargetIceCreamSlug(catSlug);
      setIceCreamIntroOpen(true);
    } else {
      setSelectedCategory(catSlug);
      if (onCategoryChange) onCategoryChange(catSlug);
    }
  };

  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        limit: 12,
        sort: sortOption,
      };

      if (selectedCategory) params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (ratingFilter) params.rating = ratingFilter;
      if (availability) params.availability = availability;

      const res = await apiService.getProducts(params);
      if (res.data.success) {
        setProducts(res.data.data);
        if (res.data.pagination) {
          setPagination({
            page: res.data.pagination.page,
            pages: res.data.pagination.pages,
            total: res.data.pagination.total,
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch catalog products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    apiService.getCategories().then((res) => {
      if (res.data.success) setCategories(res.data.data);
    });
  }, []);

  useEffect(() => {
    const catFromUrl = searchParams.get('category') || '';
    const searchFromUrl = searchParams.get('search') || '';
    if (catFromUrl) setSelectedCategory(catFromUrl);
    if (searchFromUrl) setSearchQuery(searchFromUrl);
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery, minPrice, maxPrice, sortOption, ratingFilter, availability, pagination.page]);

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setSortOption('newest');
    setRatingFilter('');
    setAvailability('');
    if (onCategoryChange) onCategoryChange('');
  };

  return (
    <div id="catalog-section" className="max-w-7xl mx-auto px-4 py-8 space-y-8 scroll-mt-20">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Catalog & Products</h2>
          <p className="text-xs text-slate-400 mt-1">Showing {pagination.total} premium products available for instant order</p>
        </div>

        {/* Sort & Search Toolbar */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option value="newest">Sort: Newest Arrival</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="popularity">Most Popular</option>
          </select>

          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden flex items-center gap-2 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 px-3 py-2 rounded-xl text-xs font-semibold"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{showMobileFilters ? 'Hide Filters' : 'Filters'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Filter Drawer */}
        <div className={`space-y-6 bg-slate-900/40 border border-slate-800 p-5 rounded-3xl h-fit ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" /> Filter Catalog
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Categories Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Category</label>
            <div className="space-y-1">
              <button
                onClick={() => handleCategorySelect('')}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-colors ${
                  selectedCategory === '' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => handleCategorySelect(cat.slug, cat)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-colors ${
                    selectedCategory === cat.slug ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Price Range (₹)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500"
              />
              <input
                type="number"
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500"
              />
            </div>
          </div>

          {/* Rating Filter */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Minimum Rating</label>
            <div className="space-y-1">
              {[4, 3, 2].map((r) => (
                <button
                  key={r}
                  onClick={() => setRatingFilter(ratingFilter === r.toString() ? '' : r.toString())}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-colors ${
                    ratingFilter === r.toString() ? 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/40' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{r} Stars & Above</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Stock Filter */}
          <div className="pt-2 border-t border-slate-800">
            <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={availability === 'in_stock'}
                onChange={(e) => setAvailability(e.target.checked ? 'in_stock' : '')}
                className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </div>

        {/* Product Grid & Pagination */}
        <div className="lg:col-span-3 space-y-8">
          <ProductGrid
            products={products}
            loading={loading}
            emptyMessage={
              selectedCategory
                ? `No products available from this category`
                : searchQuery
                ? `No products found matching "${searchQuery}".`
                : 'No products available in catalog.'
            }
            onResetFilters={handleResetFilters}
          />

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center space-x-2 pt-4">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                className="px-4 py-2 bg-slate-900 border border-slate-800 disabled:opacity-40 text-xs font-semibold text-slate-300 rounded-xl"
              >
                Previous
              </button>

              <span className="text-xs text-slate-400 px-3">
                Page {pagination.page} of {pagination.pages}
              </span>

              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                className="px-4 py-2 bg-slate-900 border border-slate-800 disabled:opacity-40 text-xs font-semibold text-slate-300 rounded-xl"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Ice Cream Fullscreen Intro Video Modal */}
      <IceCreamIntroModal
        isOpen={iceCreamIntroOpen}
        targetCategorySlug={targetIceCreamSlug}
        onClose={() => {
          setIceCreamIntroOpen(false);
          setSelectedCategory(targetIceCreamSlug);
        }}
      />
    </div>
  );
};
