import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingBag, Heart, Share2, ShieldCheck, Truck, RotateCcw, ThumbsUp, Sparkles, MessageSquare } from 'lucide-react';
import { ImageGalleryZoom } from '../components/product/ImageGalleryZoom';
import { ProductGrid } from '../components/product/ProductGrid';
import { apiService } from '../services/api';
import { Product, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const ProductDetailPage: React.FC = () => {
  const { identifier } = useParams<{ identifier: string }>();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Form Modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (!identifier) return;
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await apiService.getProductBySlugOrId(identifier);
        if (res.data.success) {
          const prod = res.data.data;
          setProduct(prod);
          apiService.logProductActivity(prod._id, 'view').catch(() => {});

          const [revRes, relRes] = await Promise.all([
            apiService.getProductReviews(prod._id),
            apiService.getRelatedProducts(prod._id, 4),
          ]);

          if (revRes.data.success) setReviews(revRes.data.data);
          if (relRes.data.success) setRelatedProducts(relRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load product detail', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [identifier]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to leave a review');
      return;
    }
    if (!product) return;

    try {
      const res = await apiService.createReview({
        productId: product._id,
        rating: newRating,
        comment: newComment,
      });

      if (res.data.success) {
        toast.success('Thank you! Review submitted.');
        setReviews([res.data.data, ...reviews]);
        setReviewModalOpen(false);
        setNewComment('');
      }
    } catch (err) {
      toast.error('Failed to post review');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied to clipboard!');
    }
  };

  if (loading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm">Loading product details...</p>
      </div>
    );
  }

  const inWishlist = isInWishlist(product._id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-16">
      {/* Product Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Gallery */}
        <ImageGalleryZoom images={product.images || []} />

        {/* Product Meta Details */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center text-xs text-indigo-400 font-bold uppercase tracking-wider mb-2">
              <span>{product.brand}</span>
              <span className="text-slate-400 font-mono">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">{product.name}</h1>

            {/* Rating Stars */}
            <div className="flex items-center space-x-3 mt-3">
              <div className="flex items-center space-x-1 bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-lg border border-amber-500/20 text-xs font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{product.rating || 4.8}</span>
              </div>
              <span className="text-xs text-slate-400">Based on {product.numReviews} verified customer reviews</span>
            </div>
          </div>

          {/* Pricing Block */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center space-x-4">
            <span className="text-3xl font-extrabold text-white">₹{product.sellingPrice.toLocaleString()}</span>
            {product.mrp > product.sellingPrice && (
              <>
                <span className="text-sm text-slate-500 line-through">₹{product.mrp.toLocaleString()}</span>
                <span className="bg-rose-500 text-white font-extrabold text-xs px-2.5 py-1 rounded-md">
                  SAVE {product.discount}%
                </span>
              </>
            )}
          </div>

          {/* Stock & Availability */}
          <div className="flex items-center space-x-3 text-xs">
            <span
              className={`px-3 py-1 rounded-full font-bold uppercase ${
                product.stock > 0
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-red-500/10 text-red-400 border border-red-500/30'
              }`}
            >
              {product.stock > 0 ? `In Stock (${product.stock} left)` : 'Out of Stock'}
            </span>
            <span className="text-slate-400">Category: <strong className="text-slate-200">{typeof product.category === 'object' ? product.category.name : 'General'}</strong></span>
          </div>

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-b border-slate-800 py-4">
            {product.description}
          </p>

          {/* CTA Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => {
                addToCart(product);
                apiService.logProductActivity(product._id, 'cart_add').catch(() => {});
              }}
              disabled={product.stock <= 0}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm py-3.5 px-6 rounded-2xl shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Add to Shopping Cart</span>
            </button>

            <button
              onClick={() => {
                toggleWishlist(product);
                apiService.logProductActivity(product._id, 'wishlist_add').catch(() => {});
              }}
              className={`p-3.5 rounded-2xl border transition-all ${
                inWishlist
                  ? 'bg-rose-500 text-white border-rose-500'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
              }`}
              title="Save to Wishlist"
            >
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-white' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-3.5 bg-slate-900 text-slate-300 hover:text-white border border-slate-800 rounded-2xl transition-all"
              title="Share Link"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-4 text-[11px] text-slate-400 text-center">
            <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800">
              <Truck className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
              <span>Fast Location Delivery</span>
            </div>
            <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
              <span>1 Year Warranty</span>
            </div>
            <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800">
              <RotateCcw className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
              <span>7 Day Replacement</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Specifications Table */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Technical Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(product.specifications).map(([key, val]) => (
              <div key={key} className="flex justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs">
                <span className="text-slate-400 font-semibold">{key}</span>
                <span className="text-slate-100 font-bold">{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verified Reviews Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-bold text-white">Verified Customer Reviews</h3>
            <p className="text-xs text-slate-400 mt-0.5">{reviews.length} total review entries</p>
          </div>

          <button
            onClick={() => setReviewModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center space-x-1.5"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
              No reviews yet. Be the first verified customer to leave a review!
            </p>
          ) : (
            reviews.map((rev) => (
              <div key={rev._id} className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      {rev.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h5 className="text-xs font-bold text-white">{rev.user?.name || 'Verified Buyer'}</h5>
                        {rev.isVerifiedPurchase && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 mt-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-500">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Write Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
            <h4 className="text-lg font-bold text-white">Write Product Review</h4>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 block font-semibold">Select Rating Star</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className="p-1.5 focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block font-semibold mb-1">Your Feedback</label>
              <textarea
                rows={4}
                required
                placeholder="Share your experience with this product..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2.5 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReviewSubmit}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 rounded-xl"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Frequently Bought Together / Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" /> Frequently Bought Together
          </h3>
          <ProductGrid products={relatedProducts} />
        </div>
      )}
    </div>
  );
};
