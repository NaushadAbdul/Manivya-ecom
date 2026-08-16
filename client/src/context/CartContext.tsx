import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Coupon } from '../types';
import toast from 'react-hot-toast';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  savedForLater: CartItem[];
  appliedCoupon: Coupon | null;
  couponDiscount: number;
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  moveToSavedForLater: (productId: string) => void;
  moveToCartFromSaved: (productId: string) => void;
  applyCoupon: (coupon: Coupon, discount: number) => void;
  removeCoupon: () => void;
  clearCart: () => void;
  subtotal: number;
  totalItemsCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('manivya_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [savedForLater, setSavedForLater] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('manivya_saved_later');
    return saved ? JSON.parse(saved) : [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);

  useEffect(() => {
    localStorage.setItem('manivya_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('manivya_saved_later', JSON.stringify(savedForLater));
  }, [savedForLater]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product._id === product._id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        toast.success(`Updated ${product.name} quantity in cart!`);
        return updated;
      } else {
        toast.success(`Added ${product.name} to cart!`);
        return [...prev, { product, quantity }];
      }
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product._id === productId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product._id !== productId));
    toast.success('Removed item from cart');
  };

  const moveToSavedForLater = (productId: string) => {
    const target = cart.find((item) => item.product._id === productId);
    if (target) {
      removeFromCart(productId);
      setSavedForLater((prev) => [...prev, target]);
      toast.success('Moved to Saved for Later');
    }
  };

  const moveToCartFromSaved = (productId: string) => {
    const target = savedForLater.find((item) => item.product._id === productId);
    if (target) {
      setSavedForLater((prev) => prev.filter((item) => item.product._id !== productId));
      addToCart(target.product, target.quantity);
    }
  };

  const applyCoupon = (coupon: Coupon, discount: number) => {
    setAppliedCoupon(coupon);
    setCouponDiscount(discount);
    toast.success(`Coupon ${coupon.code} applied! Saved ₹${discount}`);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    toast.success('Coupon removed');
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        savedForLater,
        appliedCoupon,
        couponDiscount,
        addToCart,
        updateQuantity,
        removeFromCart,
        moveToSavedForLater,
        moveToCartFromSaved,
        applyCoupon,
        removeCoupon,
        clearCart,
        subtotal,
        totalItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
