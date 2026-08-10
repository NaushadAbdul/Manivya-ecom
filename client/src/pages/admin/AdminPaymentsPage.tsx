import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Eye, ShieldAlert, DollarSign, Clock, CheckCheck } from 'lucide-react';
import { apiService } from '../../services/api';
import { PaymentRecord } from '../../types';
import toast from 'react-hot-toast';

export const AdminPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentsAnalytics, setPaymentsAnalytics] = useState<any>(null);

  // Inspector modal
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadPendingPayments = async () => {
    try {
      setLoading(true);
      const res = await apiService.getPendingPaymentsAdmin();
      if (res.data.success) {
        setPayments(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load pending payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingPayments();
    apiService.getAdminPaymentAnalytics().then((r) => {
      if (r.data.success) setPaymentsAnalytics(r.data.data);
    }).catch(() => {});
  }, []);

  const handleVerify = async (paymentId: string, action: 'approve' | 'reject') => {
    try {
      const res = await apiService.verifyPaymentAdmin(paymentId, action, rejectionReason);
      if (res.data.success) {
        toast.success(`Payment ${action}d!`);
        setSelectedPayment(null);
        setRejectionReason('');
        loadPendingPayments();
      }
    } catch (err) {
      toast.error('Verification failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Live Payment Analytics KPI Strip ──────────────────────── */}
      {paymentsAnalytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Collected', value: `₹${Math.round(paymentsAnalytics.totalCollected ?? 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400' },
            { label: 'Pending Review', value: paymentsAnalytics.pending ?? 0, icon: Clock, color: 'text-amber-400' },
            { label: 'Approved', value: paymentsAnalytics.approved ?? 0, icon: CheckCheck, color: 'text-emerald-400' },
            { label: 'Rejected', value: paymentsAnalytics.rejected ?? 0, icon: XCircle, color: 'text-rose-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-2.5">
              <Icon className={`w-4 h-4 ${color} shrink-0`} />
              <div>
                <p className={`text-base font-extrabold ${color}`}>{value}</p>
                <p className="text-[10px] text-slate-400 font-semibold">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
        <h2 className="text-xl font-extrabold text-white">QR Code Payment Verification Queue</h2>
        <p className="text-xs text-slate-400 mt-0.5">Inspect uploaded UTR transaction screenshots and approve or reject order payment proofs</p>
      </div>

      {payments.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/40 border border-slate-800 rounded-3xl">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">No Pending Payments</h3>
          <p className="text-xs text-slate-400">All customer QR Code payment submissions have been reviewed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {payments.map((p) => (
            <div key={p._id} className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white">Amount: ₹{p.amount.toLocaleString()}</span>
                <span className="bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded text-[10px]">
                  Pending Moderation
                </span>
              </div>

              {p.proofImage || (p.order as any)?.paymentInfo?.proofImage ? (
                <div
                  onClick={() => setSelectedPayment(p)}
                  className="h-44 bg-slate-950 rounded-2xl overflow-hidden cursor-pointer border border-slate-800 relative group"
                >
                  <img
                    src={p.proofImage || (p.order as any)?.paymentInfo?.proofImage}
                    alt="Payment Screenshot Proof"
                    className="w-full h-full object-contain bg-slate-950 p-2 group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity gap-1">
                    <Eye className="w-4 h-4 text-indigo-400" /> Inspect Full Image
                  </div>
                </div>
              ) : (
                <div className="h-44 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center p-4 space-y-2">
                  <ShieldAlert className="w-8 h-8 text-amber-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-300">Pending Screenshot Upload</span>
                  <p className="text-[10px] text-slate-500">Customer placed QR order. Awaiting UTR screenshot upload.</p>
                </div>
              )}

              <div className="text-xs space-y-1">
                <p className="text-slate-400">Transaction ID: <strong className="text-white font-mono">{p.transactionId || 'N/A'}</strong></p>
                <p className="text-slate-400">Customer: <strong className="text-slate-200">{p.user?.name} ({p.user?.email})</strong></p>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => handleVerify(p._id, 'approve')}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center space-x-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve</span>
                </button>

                <button
                  onClick={() => setSelectedPayment(p)}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center space-x-1"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inspector Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4">
            <h3 className="text-base font-bold text-white">Payment Screenshot Inspector</h3>

            {(selectedPayment.proofImage || (selectedPayment.order as any)?.paymentInfo?.proofImage) ? (
              <img
                src={selectedPayment.proofImage || (selectedPayment.order as any)?.paymentInfo?.proofImage}
                alt="Payment Screenshot"
                className="max-h-80 w-full object-contain rounded-2xl bg-slate-950 border border-slate-800 p-2"
              />
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-950 rounded-2xl border border-slate-800">
                No screenshot uploaded yet by customer.
              </div>
            )}

            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Rejection Reason (if rejecting)</label>
              <input
                type="text"
                placeholder="e.g. Screenshot unreadable / UTR invalid"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button onClick={() => setSelectedPayment(null)} className="flex-1 bg-slate-800 text-xs font-semibold py-2.5 rounded-xl text-slate-300">
                Cancel
              </button>
              <button onClick={() => handleVerify(selectedPayment._id, 'reject')} className="flex-1 bg-rose-600 text-xs font-bold py-2.5 rounded-xl text-white">
                Reject Payment
              </button>
              <button onClick={() => handleVerify(selectedPayment._id, 'approve')} className="flex-1 bg-emerald-600 text-xs font-bold py-2.5 rounded-xl text-white">
                Approve Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
