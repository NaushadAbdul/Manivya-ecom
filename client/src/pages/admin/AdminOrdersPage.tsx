import React, { useEffect, useState } from 'react';
import { Truck, CheckCircle, Clock, Search, CheckCircle2, XCircle, Package, ShoppingBag } from 'lucide-react';
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
          orders.map((o) => (
            <div key={o._id} className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="font-extrabold text-white text-sm">Order #{o.orderNumber}</span>
                  <span className="text-xs text-slate-400 ml-2 font-mono">({o.trackingNumber || 'Pending TRK'})</span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs text-slate-400">Status:</span>
                  <select
                    value={o.orderStatus || 'Confirmed'}
                    onChange={(e) => handleStatusUpdate(o._id, e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-indigo-400 font-bold text-xs px-3 py-1.5 rounded-xl"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-slate-500 font-semibold uppercase">Customer Info</p>
                  <p className="text-white font-bold mt-0.5">{typeof o.user === 'object' ? (o.user?.name || 'Valued Customer') : 'Customer'}</p>
                  <p className="text-slate-400">{typeof o.user === 'object' ? (o.user?.email || '') : ''}</p>
                </div>

                <div>
                  <p className="text-slate-500 font-semibold uppercase">Delivery Address</p>
                  <p className="text-slate-300 mt-0.5">{o.shippingAddress?.fullAddress || 'Standard Address'}</p>
                  <p className="text-slate-400">{o.shippingAddress?.city || 'Visakhapatnam'}, {o.shippingAddress?.postalCode || '530026'}</p>
                </div>

                <div>
                  <p className="text-slate-500 font-semibold uppercase">Payment</p>
                  <p className="text-emerald-400 font-extrabold mt-0.5">₹{(o.totalAmount || 0).toLocaleString()}</p>
                  <p className="text-slate-400 uppercase font-mono">{o.paymentMethod || 'COD'} ({o.paymentInfo?.status || 'Pending'})</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
