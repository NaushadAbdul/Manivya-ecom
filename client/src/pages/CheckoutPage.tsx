import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AddressMapPicker } from '../components/checkout/AddressMapPicker';
import { PaymentMethodSelector } from '../components/checkout/PaymentMethodSelector';
import { QRPaymentModal } from '../components/checkout/QRPaymentModal';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { Address } from '../types';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

export const CheckoutPage: React.FC = () => {
  const { cart, subtotal, couponDiscount, clearCart } = useCart();
  const { currentLocation, shippingInfo } = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(currentLocation);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'qr_code' | 'razorpay'>('razorpay');
  const [transactionId, setTransactionId] = useState<string>('');
  const [placingOrder, setPlacingOrder] = useState(false);

  // QR Code Modal & Verification State
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isQRVerified, setIsQRVerified] = useState(false);

  const grandTotal = Math.max(0, subtotal - couponDiscount + shippingInfo.shippingFee);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    if (!user) {
      toast.error('Please login to complete checkout');
      navigate('/auth');
      return;
    }

    const finalAddress = selectedAddress || currentLocation;
    if (!finalAddress || !finalAddress.fullAddress) {
      toast.error('Please select or fill in a valid shipping address.');
      return;
    }

    try {
      setPlacingOrder(true);
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error('Failed to load Razorpay SDK. Please check your internet connection.');
        setPlacingOrder(false);
        return;
      }

      // Create Razorpay order on backend
      const rzpOrderRes = await apiService.createRazorpayOrder(grandTotal);
      const rzpData = rzpOrderRes.data.data;

      const options = {
        key: rzpData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: rzpData.amount,
        currency: rzpData.currency || 'INR',
        name: 'MANIVYA Enterprises',
        description: 'E-Commerce Online Order Payment',
        order_id: rzpData.id.startsWith('rzp_order_') ? undefined : rzpData.id,
        handler: async function (response: any) {
          try {
            toast.loading('Payment received! Finalizing your order...');
            const itemsPayload = cart.map((i) => ({
              product: i.product._id,
              name: i.product.name,
              slug: i.product.slug,
              quantity: i.quantity,
            }));

            const orderRes = await apiService.createOrder({
              items: itemsPayload,
              shippingAddress: finalAddress,
              paymentMethod: 'razorpay',
              discountAmount: couponDiscount,
              transactionId: response.razorpay_payment_id || `rzp_${Date.now()}`,
            });

            if (orderRes.data.success) {
              const createdOrder = orderRes.data.data;
              await apiService.verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: createdOrder._id,
              });

              clearCart();
              toast.dismiss();
              toast.success(`Payment verified! Order #${createdOrder.orderNumber} placed successfully.`);
              navigate(`/orders/${createdOrder._id}`);
            }
          } catch (err: any) {
            toast.dismiss();
            toast.error(err.response?.data?.error || 'Failed to finalize order after payment.');
          } finally {
            setPlacingOrder(false);
          }
        },
        prefill: {
          name: user.name || '',
          email: user.email || '',
          contact: user.phone || '',
        },
        notes: {
          address: finalAddress.fullAddress,
        },
        theme: {
          color: '#6366f1',
        },
        modal: {
          ondismiss: function () {
            toast.error('Payment cancelled.');
            setPlacingOrder(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Razorpay order creation failed.');
      setPlacingOrder(false);
    }
  };

  const executePlaceOrder = async (txId?: string) => {
    if (!user) {
      toast.error('Please login to complete checkout');
      navigate('/auth');
      return;
    }

    const finalAddress = selectedAddress || currentLocation;
    if (!finalAddress || !finalAddress.fullAddress) {
      toast.error('Please select or fill in a valid shipping address.');
      return;
    }

    try {
      setPlacingOrder(true);
      const itemsPayload = cart.map((i) => ({
        product: i.product._id,
        name: i.product.name,
        slug: i.product.slug,
        quantity: i.quantity,
      }));

      const res = await apiService.createOrder({
        items: itemsPayload,
        shippingAddress: finalAddress,
        paymentMethod,
        discountAmount: couponDiscount,
        transactionId: txId || transactionId,
      });

      if (res.data.success) {
        const createdOrder = res.data.data;
        clearCart();
        toast.success(`Order #${createdOrder.orderNumber} placed successfully!`);
        navigate(`/orders/${createdOrder._id}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to place order.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handlePlaceOrderClick = () => {
    const finalAddress = selectedAddress || currentLocation;
    if (!finalAddress || !finalAddress.fullAddress) {
      toast.error('Please select or fill in a valid shipping address.');
      return;
    }

    if (paymentMethod === 'razorpay') {
      handleRazorpayPayment();
      return;
    }

    // If QR code payment is selected and not yet verified in popup, open QR payment popup modal
    if (paymentMethod === 'qr_code' && !isQRVerified) {
      setIsQRModalOpen(true);
      return;
    }

    executePlaceOrder();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-extrabold text-white">Express Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Address & Payment Selection */}
        <div className="lg:col-span-2 space-y-8">
          {/* Step 1: Shipping Address Selection */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              1. Delivery Shipping Address
            </h3>
            <AddressMapPicker onAddressSelect={(addr) => setSelectedAddress(addr)} />
          </div>

          {/* Step 2: Payment Selector */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
            <PaymentMethodSelector
              amount={grandTotal}
              paymentMethod={paymentMethod}
              isQRVerified={isQRVerified}
              onMethodChange={(m) => {
                setPaymentMethod(m);
                if (m === 'qr_code' && !isQRVerified) {
                  setIsQRModalOpen(true);
                }
              }}
              onOpenQRModal={() => setIsQRModalOpen(true)}
            />
          </div>
        </div>

        {/* Right Column: Summary Card */}
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4 sticky top-24">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Final Order Summary</h3>

            {/* Cart Item Preview */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.product._id} className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2 truncate">
                    <span className="font-bold text-indigo-400">{item.quantity}x</span>
                    <span className="text-slate-200 truncate">{item.product.name}</span>
                  </div>
                  <span className="text-white font-semibold shrink-0">₹{(item.product.sellingPrice * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-800 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Items Subtotal</span>
                <span className="text-white font-bold">₹{subtotal.toLocaleString()}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon Savings</span>
                  <span className="font-bold">-₹{couponDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Shipping Fee ({shippingInfo.warehouse})</span>
                <span className="text-emerald-400 font-bold">
                  {shippingInfo.shippingFee === 0 ? 'FREE' : `₹${shippingInfo.shippingFee}`}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 flex justify-between items-baseline">
              <span className="text-sm font-bold text-white">Amount Payable</span>
              <span className="text-2xl font-extrabold text-white">₹{grandTotal.toLocaleString()}</span>
            </div>

            <button
              onClick={handlePlaceOrderClick}
              disabled={placingOrder || cart.length === 0}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm py-4 rounded-2xl shadow-xl shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {placingOrder
                ? 'Processing Payment & Order...'
                : paymentMethod === 'razorpay'
                ? 'Pay via Razorpay & Place Order'
                : paymentMethod === 'qr_code' && !isQRVerified
                ? 'Pay via QR Code & Order'
                : 'Place Order Now (COD)'}
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Glassmorphism Payment Popup Modal */}
      <QRPaymentModal
        amount={grandTotal}
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        onCancelToCOD={() => setIsQRModalOpen(false)}
        onPaymentSuccess={(txId) => {
          setTransactionId(txId);
          setIsQRVerified(true);
          setIsQRModalOpen(false);
          executePlaceOrder(txId);
        }}
      />
    </div>
  );
};
