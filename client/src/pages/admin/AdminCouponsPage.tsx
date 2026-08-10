import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
import { apiService } from '../../services/api';
import { Coupon } from '../../types';
import toast from 'react-hot-toast';

export const AdminCouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [expiryDate, setExpiryDate] = useState('2027-12-31');

  const loadCoupons = async () => {
    try {
      const res = await apiService.getCouponsAdmin();
      if (res.data.success) setCoupons(res.data.data);
    } catch (err) {
      toast.error('Failed to load coupons');
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiService.createCouponAdmin({
        code,
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderAmount: parseFloat(minOrderAmount) || 0,
        expiryDate,
      });
      if (res.data.success) {
        toast.success('Coupon code created!');
        setModalOpen(false);
        setCode('');
        setDiscountValue('');
        loadCoupons();
      }
    } catch (err) {
      toast.error('Coupon creation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete coupon?')) {
      await apiService.deleteCouponAdmin(id);
      toast.success('Coupon removed');
      loadCoupons();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
        <div>
          <h2 className="text-xl font-extrabold text-white">Coupons & Promotional Offers</h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage promotional checkout discount codes</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Coupon Code</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {coupons.map((c) => (
          <div key={c._id} className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-emerald-400 font-mono uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {c.code}
              </span>
              <p className="text-xs text-white font-bold mt-1">
                {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
              </p>
              <p className="text-[11px] text-slate-400">Min Order: ₹{c.minOrderAmount}</p>
            </div>
            <button onClick={() => handleDelete(c._id)} className="p-1.5 text-slate-500 hover:text-rose-400">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-white">Create Promo Coupon</h3>
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Coupon Code (Uppercase)</label>
              <input type="text" required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Discount Type</label>
                <select value={discountType} onChange={(e: any) => setDiscountType(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Value</label>
                <input type="number" required value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Min Order Subtotal ₹</label>
              <input type="number" value={minOrderAmount} onChange={(e) => setMinOrderAmount(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
            </div>

            <div className="flex space-x-3 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="flex-1 bg-slate-800 text-xs font-semibold py-2.5 rounded-xl text-slate-300">Cancel</button>
              <button type="submit" className="flex-1 bg-indigo-600 text-xs font-bold py-2.5 rounded-xl text-white">Save Coupon</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
