import React from 'react';
import { QrCode, Banknote, CheckCircle2, AlertCircle, CreditCard, ShieldCheck, Zap } from 'lucide-react';

interface PaymentMethodSelectorProps {
  amount: number;
  paymentMethod: 'cod' | 'qr_code' | 'razorpay';
  onMethodChange: (method: 'cod' | 'qr_code' | 'razorpay') => void;
  onOpenQRModal?: () => void;
  isQRVerified?: boolean;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  amount,
  paymentMethod,
  onMethodChange,
  onOpenQRModal,
  isQRVerified = false,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Select Payment Method</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Razorpay Online Payment Option (Recommended) */}
        <div
          onClick={() => onMethodChange('razorpay')}
          className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden ${
            paymentMethod === 'razorpay'
              ? 'bg-indigo-600/10 border-indigo-500 shadow-lg shadow-indigo-500/20'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-[10px] font-extrabold text-white rounded-full flex items-center space-x-1">
            <Zap className="w-2.5 h-2.5 fill-current" />
            <span>Fast Checkout</span>
          </div>

          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Razorpay Online</h4>
                <p className="text-xs text-slate-400">UPI, Cards, NetBanking, Wallet</p>
              </div>
            </div>
            {paymentMethod === 'razorpay' && <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" />}
          </div>
        </div>

        {/* Cash on Delivery Option */}
        <div
          onClick={() => onMethodChange('cod')}
          className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
            paymentMethod === 'cod'
              ? 'bg-indigo-600/10 border-indigo-500 shadow-lg shadow-indigo-500/10'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Cash on Delivery (COD)</h4>
                <p className="text-xs text-slate-400">Pay cash upon parcel delivery</p>
              </div>
            </div>
            {paymentMethod === 'cod' && <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" />}
          </div>
        </div>

        {/* QR Code Instant Payment Option */}
        <div
          onClick={() => {
            onMethodChange('qr_code');
            if (onOpenQRModal) onOpenQRModal();
          }}
          className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
            paymentMethod === 'qr_code'
              ? 'bg-indigo-600/10 border-indigo-500 shadow-lg shadow-indigo-500/10'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">UPI / Bank QR</h4>
                <p className="text-xs text-slate-400">Instant QR scan & Pay before ordering</p>
              </div>
            </div>
            {paymentMethod === 'qr_code' && <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" />}
          </div>
        </div>
      </div>



      {/* QR Code Banner Status Card */}
      {paymentMethod === 'qr_code' && (
        <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">
                {isQRVerified ? 'UPI Payment Verified ✓' : 'Pay First via QR Code (5-Min Timer)'}
              </span>
              <span className="text-slate-400 block text-[11px]">
                {isQRVerified
                  ? 'Payment completed & verified. Click Place Order to finish.'
                  : 'Scan QR in modal popup to pay before placing your order.'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenQRModal && onOpenQRModal()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-md shrink-0"
          >
            {isQRVerified ? 'View QR Payment Receipt' : 'Open QR Payment Window'}
          </button>
        </div>
      )}


    </div>
  );
};
