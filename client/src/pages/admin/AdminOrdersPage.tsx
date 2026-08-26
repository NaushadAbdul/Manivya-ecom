import React, { useEffect, useState } from 'react';
import { Truck, CheckCircle, Clock, Search, CheckCircle2, XCircle, Package, ShoppingBag, Trash2, User, Mail, Phone, MapPin, CreditCard } from 'lucide-react';
import { apiService } from '../../services/api';
import { Order } from '../../types';
import toast from 'react-hot-toast';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [analytics, setAnalytics] = useState<any>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await apiService.getAllOrdersAdmin({ status: statusFilter, search });
      if (res.data && res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to fetch admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // Fetch analytics for KPI strip
    apiService.getAdminOrders().then((r) => {
      if (r.data.success) setAnalytics(r.data.data);
    }).catch(() => {});
  }, [statusFilter, search]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const res = await apiService.updateOrderStatusAdmin(orderId, newStatus);
      if (res.data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        loadOrders();
      }
    } catch (err) {
      toast.error('Status update failed');
    }
  };

  const handleDeleteOrder = async (orderId: string, orderNum: string) => {
    if (window.confirm(`Permanently delete Order #${orderNum} from database?`)) {
      try {
        const res = await apiService.deleteOrderAdmin(orderId);
        if (res.data.success) {
          toast.success(`Order #${orderNum} deleted successfully`);
          loadOrders();
        }
      } catch (err) {
        toast.error('Failed to delete order');
      }
    }
  };

  const statuses = ['Confirmed', 'Preparing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Loading order dispatch management logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Live Order Analytics KPI Strip ─────────────────────────────── */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total', value: analytics.total, icon: ShoppingBag, color: 'text-indigo-400' },
            { label: 'Confirmed', value: analytics.byStatus?.['Confirmed']?.count ?? 0, icon: Clock, color: 'text-blue-400' },
            { label: 'Shipped', value: analytics.byStatus?.['Shipped']?.count ?? 0, icon: Truck, color: 'text-indigo-400' },
            { label: 'Delivered', value: analytics.byStatus?.['Delivered']?.count ?? 0, icon: CheckCircle2, color: 'text-emerald-400' },
            { label: 'Cancelled', value: analytics.byStatus?.['Cancelled']?.count ?? 0, icon: XCircle, color: 'text-rose-400' },
            { label: 'Success Rate', value: `${analytics.successRate}%`, icon: CheckCircle, color: analytics.successRate >= 70 ? 'text-emerald-400' : 'text-amber-400' },
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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
        <div>
          <h2 className="text-xl font-extrabold text-white">Order Dispatch Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">Update status steps, assign delivery notes, and monitor live tracking</p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search Order Number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
          >
            <option value="">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-3">
            <Truck className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Orders Found</h3>
            <p className="text-xs max-w-sm mx-auto">There are currently no customer orders matching your search or status filter.</p>
          </div>
        ) : (
          orders.map((o) => {
            const customerName = o.shippingAddress?.name || (typeof o.user === 'object' ? o.user?.name : '') || 'Valued Customer';
            const customerEmail = typeof o.user === 'object' ? o.user?.email : '';
            const customerPhone = o.shippingAddress?.phone || (typeof o.user === 'object' ? o.user?.phone : '') || '';
            const payStatus = o.paymentInfo?.status || 'Pending';

            return (
              <div key={o._id} className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl space-y-4 hover:border-slate-700/80 transition-all">
                {/* Header Row: Order #, Tracking, Status Dropdown & Delete Icon */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="font-extrabold text-white text-base">Order #{o.orderNumber}</span>
                    <span className="text-xs text-indigo-400 font-mono bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-lg">
                      {o.trackingNumber || 'Pending TRK'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-400">Status:</span>
                      <select
                        value={o.orderStatus || 'Confirmed'}
                        onChange={(e) => handleStatusUpdate(o._id, e.target.value)}
                        className="bg-slate-950 border border-slate-700 text-indigo-400 font-bold text-xs px-3 py-1.5 rounded-xl outline-none focus:border-indigo-500"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* Red Delete Trash Icon */}
                    <button
                      onClick={() => handleDeleteOrder(o._id, o.orderNumber)}
                      title="Delete Order Permanently"
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-xl border border-rose-500/30 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 3-Column Info Grid: Customer Personal Details, Delivery Address & Payment Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Customer Personal Details */}
                  <div className="space-y-1 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/80">
                    <p className="text-slate-500 font-extrabold uppercase text-[10px] tracking-wider flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-indigo-400" /> Customer Personal Details
                    </p>
                    <p className="text-white font-bold text-sm">{customerName}</p>
                    {customerEmail && (
                      <p className="text-slate-300 flex items-center gap-1 text-[11px]">
                        <Mail className="w-3 h-3 text-slate-400" /> {customerEmail}
                      </p>
                    )}
                    {customerPhone && (
                      <p className="text-slate-300 flex items-center gap-1 text-[11px]">
                        <Phone className="w-3 h-3 text-slate-400" /> {customerPhone}
                      </p>
                    )}
                  </div>

                  {/* Delivery Address */}
                  <div className="space-y-1 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/80">
                    <p className="text-slate-500 font-extrabold uppercase text-[10px] tracking-wider flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Delivery Address
                    </p>
                    <p className="text-slate-200 font-semibold text-xs leading-relaxed">
                      {o.shippingAddress?.fullAddress || 'Standard Delivery Location'}
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      {o.shippingAddress?.city ? `${o.shippingAddress.city}, ${o.shippingAddress.state || ''} - ${o.shippingAddress.postalCode || ''}` : 'Visakhapatnam, Andhra Pradesh'}
                    </p>
                  </div>

                  {/* Payment Details & Status Badge */}
                  <div className="space-y-1 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/80">
                    <p className="text-slate-500 font-extrabold uppercase text-[10px] tracking-wider flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> Payment Info
                    </p>
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-emerald-400 font-black text-base">₹{(o.totalAmount || 0).toLocaleString()}</span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase border ${
                          payStatus === 'Verified' || payStatus === 'Paid'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : payStatus === 'Rejected'
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {payStatus}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] font-mono uppercase">
                      Method: <span className="text-white font-bold">{o.paymentMethod || 'COD'}</span>
                    </p>
                  </div>
                </div>

                {/* Products Ordered List Section (With Product Image) */}
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-indigo-400" /> Products Ordered ({o.items?.length || 0})
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {o.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-3 bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150'}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg bg-slate-950 shrink-0 border border-slate-800"
                        />
                        <div className="flex-1 min-w-0 text-xs">
                          <p className="font-bold text-white truncate">{item.name}</p>
                          <div className="flex justify-between items-center text-slate-400 mt-0.5 text-[11px]">
                            <span>Qty: <strong className="text-indigo-400">{item.quantity}</strong></span>
                            <span className="font-semibold text-emerald-400">₹{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
