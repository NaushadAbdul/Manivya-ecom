import React, { useState, useEffect } from 'react';
import { QrCode, X, Copy, CheckCircle2, Clock, RotateCcw, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

interface QRPaymentModalProps {
  amount: number;
  isOpen: boolean;
  onClose: () => void;
  onCancelToCOD: () => void;
  onPaymentSuccess: (transactionId: string) => void;
}

export const QRPaymentModal: React.FC<QRPaymentModalProps> = ({
  amount,
  isOpen,
  onClose,
  onCancelToCOD,
  onPaymentSuccess,
}) => {
  const [transactionId, setTransactionId] = useState('');
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentDoneStep, setPaymentDoneStep] = useState(false);

  // 5-minute countdown timer (300 seconds)
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(300);
      setIsExpired(false);
      setPaymentDoneStep(false);
      setIsVerifying(false);
      setTransactionId('');
      return;
    }

    if (paymentDoneStep) return;

    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeLeft, paymentDoneStep]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText('7207554777@sbi');
    setCopied(true);
    toast.success('UPI ID copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const resetTimer = () => {
    setTimeLeft(300);
    setIsExpired(false);
    toast.success('Timer reset for 5 minutes');
  };

  const handleVerifyPayment = () => {
    if (isExpired) {
      toast.error('Payment session expired. Please reset timer or switch to COD.');
      return;
    }

    setIsVerifying(true);
    // Simulate banking verification check (1.5 seconds)
    setTimeout(() => {
      setIsVerifying(false);
      setPaymentDoneStep(true);
      toast.success('Payment Verified! Payment Done.');
    }, 1500);
  };

  const handleFinalContinueOrder = () => {
    const finalTxId = transactionId.trim() || `UPI-${Date.now().toString().slice(-8)}`;
    onPaymentSuccess(finalTxId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 animate-fadeIn">
      <div className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl shadow-indigo-500/20 relative backdrop-blur-xl animate-scale">
        {/* Top Right X Button to Close QR Payment Window */}
        <button
          onClick={onClose}
          title="Close Payment Window"
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 border border-slate-700/50 transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* State 1: QR Payment Scan & Verification Form */}
        {!paymentDoneStep ? (
          <div className="space-y-5">
            {/* Modal Title Banner */}
            <div className="text-center space-y-1 pr-6">
              <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
                <QrCode className="w-5 h-5 text-indigo-400" /> Scan QR Code
              </h2>
              <p className="text-xs text-slate-400">Scan this QR Code in any UPI app to make payment.</p>
            </div>

            {/* 5-Minute Countdown Timer Indicator */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-semibold transition-all ${
                isExpired
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : timeLeft < 60
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 animate-pulse shrink-0" />
                <span>{isExpired ? 'Session Expired' : 'Pay within 5 mins to order'}</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-black tracking-wider">
                  {formatTime(timeLeft)}
                </span>
                {isExpired && (
                  <button
                    onClick={resetTimer}
                    className="p-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Existing Merchant QR Code Container */}
            <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-200 text-center relative overflow-hidden space-y-2">
              {isExpired && (
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-10 space-y-2">
                  <span className="text-xs font-extrabold text-rose-400">QR Code Expired</span>
                  <button
                    onClick={resetTimer}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset 5m Timer</span>
                  </button>
                </div>
              )}

              <img
                src="/payment-qr.jpg"
                alt="MANIVYA Merchant QR Code (7207554777@sbi)"
                className={`w-48 h-48 object-contain mx-auto rounded-xl ${isExpired ? 'blur-sm' : ''}`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=7207554777@sbi&pn=MANIVYA%20Enterprises&am=${amount}&cu=INR`;
                }}
              />

              <div className="pt-1">
                <span className="text-[11px] font-bold text-slate-800 block">Scan via any UPI App</span>
                <span className="text-[10px] text-slate-500 block">Amount Payable: <strong>₹{amount.toLocaleString()}</strong></span>
              </div>
            </div>

            {/* Manual UPI Copy Box */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400 font-medium">
                <span>Or enter the code manually</span>
                <span className="text-[11px] text-indigo-400 font-semibold">UPI ID</span>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value="7207554777@sbi"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono font-semibold select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyUPI}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl transition-all shadow-md shrink-0 flex items-center justify-center"
                  title="Copy UPI ID"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* UTR / Transaction ID Field with Auto-Verification */}
            <div className="space-y-1 text-xs">
              <label className="text-slate-400 font-medium block">UPI Ref / UTR No.</label>
              <input
                type="text"
                placeholder="Enter 12-digit UTR number after payment"
                value={transactionId}
                onChange={(e) => {
                  const val = e.target.value;
                  setTransactionId(val);
                  if (val.trim().length >= 6 && !isVerifying) {
                    handleVerifyPayment();
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Real-time Payment Status Message */}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-center space-y-1">
              <div className="flex items-center justify-center space-x-2 text-xs text-indigo-400 font-semibold">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                <span>Waiting for UPI payment confirmation...</span>
              </div>
              <p className="text-[10px] text-slate-500">Scan QR Code above to pay ₹{amount.toLocaleString()}</p>
            </div>
          </div>
        ) : (
          /* State 2: Payment Done Verification Screen (Aesthetic matching Image 3) */
          <div className="py-6 text-center space-y-6 animate-scale">
            {/* Glowing Purple Checkmark Badge */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-2xl shadow-purple-500/50 ring-8 ring-purple-500/20 animate-pulse">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white">Payment Completed</h2>
              <p className="text-sm font-bold text-purple-400">Payment Done ✓</p>
              <p className="text-xs text-slate-300">Your transaction of ₹{amount.toLocaleString()} was successful.</p>
            </div>

            <div className="bg-slate-950 border border-slate-800/80 p-3.5 rounded-2xl text-xs space-y-1 text-left">
              <div className="flex justify-between text-slate-400">
                <span>Payment Method</span>
                <span className="text-white font-bold">UPI / QR Code</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Status</span>
                <span className="text-emerald-400 font-bold">Verified & Received</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinalContinueOrder}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm py-3.5 rounded-2xl shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <span>Continue to Place Order</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
