import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Heart, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const inWishlist = isInWishlist(product._id);

  const mainImage = product.images?.[0] || '';

  return (
    <div className="group relative bg-[#131B2E] border border-slate-800/80 hover:border-indigo-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col justify-between">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {product.discount > 0 && (
          <span className="bg-rose-500 text-white font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-md shadow-md">
            {product.discount}% OFF
          </span>
        )}
        {product.featured && (
          <span className="bg-indigo-600/90 text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded-md backdrop-blur-md flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5" /> Featured
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(product);
        }}
        className={`absolute top-3 right-3 z-10 p-2 rounded-xl backdrop-blur-md transition-all ${
          inWishlist
            ? 'bg-rose-500 text-white'
            : 'bg-slate-950/60 text-slate-300 hover:text-white hover:bg-slate-900'
        }`}
        title="Toggle Wishlist"
      >
        <Heart className={`w-4 h-4 ${inWishlist ? 'fill-white' : ''}`} />
      </button>

      {/* Image Container */}
      <Link to={`/product/${product.slug || product._id}`} className="relative block h-36 sm:h-52 overflow-hidden bg-slate-950/50">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.availability === 'out_of_stock' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-red-500/20 text-red-400 font-bold text-[10px] sm:text-xs px-2.5 py-1 rounded-full border border-red-500/30">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Details Body */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center text-[10px] sm:text-[11px] text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-indigo-400 truncate max-w-[80px] sm:max-w-none">{product.brand}</span>
            <div className="flex items-center space-x-1 bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400" />
              <span className="font-bold">{product.rating || 4.5}</span>
            </div>
          </div>

          <Link to={`/product/${product.slug || product._id}`}>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-800/60 flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-1 sm:space-x-2">
              <span className="text-xs sm:text-base font-extrabold text-white">₹{product.sellingPrice.toLocaleString()}</span>
              {product.mrp > product.sellingPrice && (
                <span className="text-[10px] sm:text-xs text-slate-500 line-through">₹{product.mrp.toLocaleString()}</span>
              )}
            </div>
          </div>

          <button
            onClick={() => addToCart(product)}
            disabled={product.availability === 'out_of_stock'}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white p-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95"
            title="Add to Cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
