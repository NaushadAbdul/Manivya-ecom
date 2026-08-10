import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, Bookmark, ArrowRight, Tag, ShieldCheck, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

export const CartPage: React.FC = () => {
  const {
    cart,
    savedForLater,
    updateQuantity,
    removeFromCart,
    moveToSavedForLater,
    moveToCartFromSaved,
    subtotal,
    appliedCoupon,
    couponDiscount,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const navigate = useNavigate();
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;

    try {
      setValidatingCoupon(true);
      const res = await apiService.validateCoupon(couponCodeInput.trim(), subtotal);
      if (res.data.success) {
        applyCoupon(res.data.data.coupon, res.data.data.discount);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid coupon code');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const finalTotal = Math.max(0, subtotal - couponDiscount);

  if (cart.length === 0 && savedForLater.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center mx-auto text-indigo-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white">Your Shopping Cart is Empty</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Discover our flagship electronics, luxury fashion, and smart home collections.
          </p>
        </div>
        <Link
          to="/shop"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-xl shadow-indigo-600/30 transition-all"
        >
          <span>Browse Catalog Now</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      <h1 className="text-2xl font-extrabold text-white">Shopping Cart & Saved Items</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.product._id}
                className="p-4 bg-slate-900/60 border border-slate-800 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={item.product.images?.[0] || ''}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-2xl bg-slate-950 border border-slate-800 shrink-0"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white line-clamp-1">{item.product.name}</h3>
                    <p className="text-xs text-indigo-400 font-semibold mt-0.5">₹{item.product.sellingPrice.toLocaleString()}</p>
                    <div className="flex items-center space-x-3 mt-2 text-xs text-slate-400">
                      <button
                        onClick={() => moveToSavedForLater(item.product._id)}
                        className="hover:text-indigo-400 flex items-center space-x-1"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Save for Later</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto space-x-6">
                  {/* Quantity Counter */}
                  <div className="flex items-center border border-slate-800 bg-slate-950 rounded-xl">
                    <button
                      onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                      className="p-2 text-slate-400 hover:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                      className="p-2 text-slate-400 hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-sm font-extrabold text-white">
                    ₹{(item.product.sellingPrice * item.quantity).toLocaleString()}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.product._id)}
                    className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Saved For Later Drawer */}
          {savedForLater.length > 0 && (
            <div className="pt-6 border-t border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Saved For Later ({savedForLater.length})</h3>
              <div className="space-y-3">
                {savedForLater.map((item) => (
                  <div key={item.product._id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img src={item.product.images?.[0]} alt="" className="w-12 h-12 object-cover rounded-xl" />
                      <div>
                        <h4 className="text-xs font-bold text-white">{item.product.name}</h4>
                        <span className="text-xs text-indigo-400 font-semibold">₹{item.product.sellingPrice}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => moveToCartFromSaved(item.product._id)}
                      className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/30 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
                    >
                      Move to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order Summary & Coupon Card */}
        <div className="space-y-6">
          {/* Coupon Code Section */}
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-indigo-400" /> Apply Coupon Code
            </h4>

            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-emerald-400">{appliedCoupon.code}</span>
                  <p className="text-[10px] text-slate-400">Discount of ₹{couponDiscount} applied</p>
                </div>
                <button onClick={removeCoupon} className="text-xs text-rose-400 font-bold hover:underline">
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code (e.g. MANIVYA10)"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white uppercase placeholder-slate-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={validatingCoupon}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
                >
                  Apply
                </button>
              </form>
            )}
          </div>

          {/* Subtotal Summary */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Order Summary</h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="text-white font-bold">₹{subtotal.toLocaleString()}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Promo Discount</span>
                  <span className="font-bold">-₹{couponDiscount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400">
                <span>Estimated Shipping</span>
                <span className="text-emerald-400 font-bold">{subtotal >= 999 ? 'FREE' : '₹79'}</span>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 flex justify-between items-baseline">
              <span className="text-sm font-bold text-white">Grand Total</span>
              <span className="text-2xl font-extrabold text-white">
                ₹{(finalTotal + (subtotal >= 999 ? 0 : 79)).toLocaleString()}
              </span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm py-3.5 rounded-2xl shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
