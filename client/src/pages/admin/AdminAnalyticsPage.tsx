import React, { useEffect, useState, useCallback } from 'react';
import {
  BarChart2,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  CreditCard,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Layers,
  Minus,
} from 'lucide-react';
import { apiService } from '../../services/api';

// ─── Reusable Stat Card ───────────────────────────────────────────────────────

const StatCard: React.FC<{
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}> = ({ label, value, sub, color = 'text-white' }) => (
  <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-xl font-extrabold ${color}`}>{value}</p>
    {sub && <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>}
  </div>
);

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader: React.FC<{ icon: React.ElementType; title: string; sub: string }> = ({
  icon: Icon,
  title,
  sub,
}) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl">
      <Icon className="w-4 h-4 text-indigo-400" />
    </div>
    <div>
      <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
      <p className="text-[10px] text-slate-400">{sub}</p>
    </div>
  </div>
);

// ─── Growth Badge ─────────────────────────────────────────────────────────────

const GrowthBadge: React.FC<{ pct: number }> = ({ pct }) => {
  if (pct === 0) return <span className="text-[10px] text-slate-500">No change</span>;
  const pos = pct > 0;
  return (
    <span className={`text-[10px] font-bold flex items-center gap-0.5 ${pos ? 'text-emerald-400' : 'text-rose-400'}`}>
      {pos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {pos ? '+' : ''}{pct}%
    </span>
  );
};

// ─── Mini Bar ─────────────────────────────────────────────────────────────────

const MiniBar: React.FC<{ value: number; max: number; color?: string }> = ({
  value,
  max,
  color = 'bg-indigo-600',
}) => {
  const pct = max > 0 ? Math.max((value / max) * 100, value > 0 ? 3 : 0) : 0;
  return (
    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const AdminAnalyticsPage: React.FC = () => {
  const [revenue, setRevenue] = useState<any>(null);
  const [orders, setOrders] = useState<any>(null);
  const [customers, setCustomers] = useState<any>(null);
  const [products, setProducts] = useState<any>(null);
  const [categories, setCategories] = useState<any>(null);
  const [inventory, setInventory] = useState<any>(null);
  const [payments, setPayments] = useState<any>(null);
  const [monthly, setMonthly] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchAll = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const [revRes, ordRes, custRes, prodRes, catRes, invRes, payRes, monRes] = await Promise.all([
        apiService.getAdminRevenue(),
        apiService.getAdminOrders(),
        apiService.getAdminCustomers(),
        apiService.getAdminProducts(),
        apiService.getAdminCategories(),
        apiService.getAdminInventory(),
        apiService.getAdminPaymentAnalytics(),
        apiService.getAdminMonthlyRevenue({ year: new Date().getFullYear() }),
      ]);
      if (revRes.data.success) setRevenue(revRes.data.data);
      if (ordRes.data.success) setOrders(ordRes.data.data);
      if (custRes.data.success) setCustomers(custRes.data.data);
      if (prodRes.data.success) setProducts(prodRes.data.data);
      if (catRes.data.success) setCategories(catRes.data.data);
      if (invRes.data.success) setInventory(invRes.data.data);
      if (payRes.data.success) setPayments(payRes.data.data);
      if (monRes.data.success) setMonthly(monRes.data.data.monthlyRevenue ?? []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Analytics fetch error', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(() => fetchAll(), 60_000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Loading analytics from MongoDB Atlas...</p>
      </div>
    );
  }

  const maxMonthlyRev = Math.max(...monthly.map((m) => m.revenue), 1);

  // Order status list for display
  const orderStatuses = [
    { key: 'Confirmed', color: 'text-blue-400', barColor: 'bg-blue-600' },
    { key: 'Preparing', color: 'text-amber-400', barColor: 'bg-amber-600' },
    { key: 'Packed', color: 'text-purple-400', barColor: 'bg-purple-600' },
    { key: 'Shipped', color: 'text-indigo-400', barColor: 'bg-indigo-600' },
    { key: 'Out for Delivery', color: 'text-orange-400', barColor: 'bg-orange-600' },
    { key: 'Delivered', color: 'text-emerald-400', barColor: 'bg-emerald-600' },
    { key: 'Cancelled', color: 'text-rose-400', barColor: 'bg-rose-600' },
    { key: 'Returned', color: 'text-pink-400', barColor: 'bg-pink-600' },
    { key: 'Refunded', color: 'text-slate-400', barColor: 'bg-slate-600' },
  ];
  const maxOrderCount = orders
    ? Math.max(...orderStatuses.map((s) => orders.byStatus[s.key]?.count ?? 0), 1)
    : 1;

  return (
    <div className="space-y-10">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Analytics Deep Dive</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            All metrics computed live via MongoDB Atlas aggregation pipelines ·{' '}
            <span className="font-mono text-slate-500">{lastUpdated.toLocaleTimeString()}</span>
          </p>
        </div>
        <button
          onClick={() => fetchAll(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-xs font-bold text-indigo-400 hover:bg-indigo-600/30 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh All
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          1. REVENUE ANALYTICS
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-5">
        <SectionHeader icon={DollarSign} title="Revenue Analytics" sub="All figures from paid/delivered orders" />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard
            label="Lifetime Revenue"
            value={`₹${Math.round(revenue?.summary?.totalRevenue ?? 0).toLocaleString()}`}
            color="text-emerald-400"
          />
          <StatCard
            label="Total Orders"
            value={(revenue?.summary?.totalOrders ?? 0).toLocaleString()}
          />
          <StatCard
            label="Avg. Order Value"
            value={`₹${Math.round(revenue?.summary?.avgOrderValue ?? 0).toLocaleString()}`}
          />
          <StatCard
            label="This Year Revenue"
            value={`₹${Math.round(monthly.reduce((s, m) => s + m.revenue, 0)).toLocaleString()}`}
          />
          <StatCard
            label="Year Orders"
            value={monthly.reduce((s, m) => s + m.orders, 0).toLocaleString()}
          />
          <StatCard
            label="Months With Sales"
            value={monthly.filter((m) => m.revenue > 0).length}
            sub={`out of 12`}
          />
        </div>

        {/* Monthly Revenue Bar Chart */}
        <div>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-3">
            Month-by-Month — {new Date().getFullYear()}
          </p>
          {monthly.every((m) => m.revenue === 0) ? (
            <p className="text-xs text-slate-500 py-4">No revenue recorded for {new Date().getFullYear()} yet</p>
          ) : (
            <div className="space-y-2">
              {monthly.filter((m) => m.revenue > 0).map((m) => (
                <div key={m.month} className="flex items-center gap-3 text-xs">
                  <span className="text-slate-400 font-semibold w-8 shrink-0">{m.month}</span>
                  <MiniBar value={m.revenue} max={maxMonthlyRev} color="bg-gradient-to-r from-indigo-600 to-purple-500" />
                  <span className="text-white font-bold w-24 text-right shrink-0">
                    ₹{(m.revenue / 1000).toFixed(1)}k
                  </span>
                  <span className="text-slate-500 w-16 text-right shrink-0">{m.orders} orders</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. ORDER ANALYTICS
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-5">
        <SectionHeader icon={ShoppingBag} title="Order Analytics" sub="All statuses from MongoDB orders collection" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
          <StatCard
            label="Total Orders"
            value={(orders?.total ?? 0).toLocaleString()}
            color="text-indigo-400"
          />
          <StatCard
            label="Delivered"
            value={(orders?.byStatus?.['Delivered']?.count ?? 0).toLocaleString()}
            color="text-emerald-400"
            sub={`₹${Math.round(orders?.byStatus?.['Delivered']?.revenue ?? 0).toLocaleString()} revenue`}
          />
          <StatCard
            label="Success Rate"
            value={`${orders?.successRate ?? 0}%`}
            color="text-emerald-400"
            sub="Delivered / Total"
          />
          <StatCard
            label="Cancellation Rate"
            value={`${orders?.cancellationRate ?? 0}%`}
            color={orders?.cancellationRate > 15 ? 'text-rose-400' : 'text-white'}
            sub="Cancelled / Total"
          />
        </div>

        {/* Status Breakdown */}
        <div>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-3">
            Status Breakdown
          </p>
          <div className="space-y-2">
            {orderStatuses.map((s) => {
              const count = orders?.byStatus?.[s.key]?.count ?? 0;
              const rev = orders?.byStatus?.[s.key]?.revenue ?? 0;
              return (
                <div key={s.key} className="flex items-center gap-3 text-xs">
                  <span className={`${s.color} font-semibold w-32 shrink-0`}>{s.key}</span>
                  <MiniBar value={count} max={maxOrderCount} color={s.barColor} />
                  <span className="text-white font-bold w-10 text-right shrink-0">{count}</span>
                  {rev > 0 && (
                    <span className="text-slate-500 w-24 text-right shrink-0">
                      ₹{Math.round(rev).toLocaleString()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Method Breakdown */}
        {orders?.paymentMethodBreakdown?.length > 0 && (
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-3">
              Payment Methods
            </p>
            <div className="flex gap-3 flex-wrap">
              {orders.paymentMethodBreakdown.map((pm: any) => (
                <div key={pm._id} className="bg-slate-950/60 border border-slate-800 px-4 py-3 rounded-2xl">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">{pm._id?.toUpperCase()}</p>
                  <p className="text-base font-extrabold text-white">{pm.count} orders</p>
                  <p className="text-[10px] text-emerald-400 font-bold">₹{Math.round(pm.revenue).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          3. CUSTOMER ANALYTICS
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-5">
        <SectionHeader icon={Users} title="Customer Analytics" sub="Registered customers from MongoDB users collection" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Customers" value={(customers?.total ?? 0).toLocaleString()} color="text-pink-400" />
          <StatCard label="Today's New" value={(customers?.today ?? 0).toLocaleString()} color="text-pink-400" />
          <StatCard label="This Week" value={(customers?.thisWeek ?? 0).toLocaleString()} />
          <StatCard label="This Month" value={(customers?.thisMonth ?? 0).toLocaleString()} />
          <StatCard
            label="Avg. Spent / Customer"
            value={`₹${Math.round(customers?.avgSpent ?? 0).toLocaleString()}`}
            color="text-emerald-400"
          />
        </div>

        {/* Top Spenders */}
        {customers?.topSpenders?.length > 0 && (
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-3">Top Spenders</p>
            <div className="space-y-2">
              {customers.topSpenders.map((u: any, idx: number) => (
                <div key={u._id} className="flex items-center gap-3 text-xs p-3 bg-slate-950/60 border border-slate-800 rounded-2xl">
                  <span className="text-[10px] font-extrabold text-slate-500 w-4 shrink-0">#{idx + 1}</span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 font-bold text-sm flex items-center justify-center shrink-0 border border-indigo-500/30">
                    {u.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate">{u.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                  </div>
                  <span className="font-extrabold text-emerald-400 shrink-0">
                    ₹{Math.round(u.totalSpent ?? 0).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daily Registrations */}
        {customers?.dailyRegistrations?.length > 0 && (
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-3">
              Daily Registrations (last 30 days)
            </p>
            <div className="space-y-1.5">
              {(() => {
                const maxReg = Math.max(...customers.dailyRegistrations.map((d: any) => d.count), 1);
                return customers.dailyRegistrations.slice(-14).map((d: any) => (
                  <div key={d._id} className="flex items-center gap-3 text-xs">
                    <span className="text-slate-500 font-mono w-24 shrink-0">{d._id}</span>
                    <MiniBar value={d.count} max={maxReg} color="bg-pink-600" />
                    <span className="text-white font-bold w-6 text-right shrink-0">{d.count}</span>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          4. PRODUCT ANALYTICS
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-5">
        <SectionHeader icon={Package} title="Product Analytics" sub="Live catalog stats from MongoDB products collection" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Products" value={(products?.total ?? 0).toLocaleString()} />
          <StatCard label="Active / In Stock" value={(products?.active ?? 0).toLocaleString()} color="text-emerald-400" />
          <StatCard
            label="Out of Stock"
            value={(products?.outOfStock ?? 0).toLocaleString()}
            color={products?.outOfStock > 0 ? 'text-rose-400' : 'text-white'}
          />
          <StatCard
            label="Low Stock (≤5)"
            value={(products?.lowStock ?? 0).toLocaleString()}
            color={products?.lowStock > 0 ? 'text-amber-400' : 'text-white'}
          />
          <StatCard label="Featured" value={(products?.featured ?? 0).toLocaleString()} />
          <StatCard label="Trending" value={(products?.trending ?? 0).toLocaleString()} />
          <StatCard
            label="Inventory Worth"
            value={`₹${Math.round(products?.stockValue ?? 0).toLocaleString()}`}
            color="text-indigo-400"
          />
          <StatCard label="Added Today" value={(products?.addedToday ?? 0).toLocaleString()} color="text-purple-400" />
        </div>

        {/* Low Stock Alert Items */}
        {products?.lowStockItems?.length > 0 && (
          <div>
            <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Low Stock Alerts
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {products.lowStockItems.map((p: any) => (
                <div key={p._id} className="flex items-center gap-3 p-3 bg-slate-950/60 border border-amber-500/20 rounded-2xl text-xs">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-slate-800 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-400">₹{p.sellingPrice?.toLocaleString()}</p>
                  </div>
                  <span className="font-extrabold text-amber-400 shrink-0">{p.stock} left</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          5. CATEGORY ANALYTICS
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-5">
        <SectionHeader icon={Layers} title="Category Analytics" sub="Products and revenue broken down by category" />

        {categories?.revenueByCategory?.length === 0 && categories?.productsByCategory?.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No category analytics available — add products and place orders</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue per category */}
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-3">Revenue by Category</p>
              {categories?.revenueByCategory?.length > 0 ? (
                <div className="space-y-2">
                  {(() => {
                    const maxCatRev = Math.max(
                      ...(categories.revenueByCategory.map((c: any) => c.revenue) ?? [1]),
                      1
                    );
                    return categories.revenueByCategory.map((c: any) => (
                      <div key={c.categoryId} className="flex items-center gap-3 text-xs">
                        <span className="text-slate-300 font-semibold w-28 shrink-0 truncate">
                          {c.name ?? 'Unknown'}
                        </span>
                        <MiniBar value={c.revenue} max={maxCatRev} color="bg-gradient-to-r from-indigo-600 to-purple-500" />
                        <span className="text-white font-bold w-20 text-right shrink-0">
                          ₹{Math.round(c.revenue).toLocaleString()}
                        </span>
                      </div>
                    ));
                  })()}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No orders placed yet</p>
              )}
            </div>

            {/* Products per category */}
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-3">Products by Category</p>
              {categories?.productsByCategory?.length > 0 ? (
                <div className="space-y-2">
                  {(() => {
                    const maxProd = Math.max(
                      ...(categories.productsByCategory.map((c: any) => c.productCount) ?? [1]),
                      1
                    );
                    return categories.productsByCategory.map((c: any) => (
                      <div key={c.categoryId} className="flex items-center gap-3 text-xs">
                        <span className="text-slate-300 font-semibold w-28 shrink-0 truncate">
                          {c.name ?? 'Unknown'}
                        </span>
                        <MiniBar value={c.productCount} max={maxProd} color="bg-purple-600" />
                        <span className="text-white font-bold w-10 text-right shrink-0">
                          {c.productCount}
                        </span>
                        <span className="text-slate-500 text-[10px] shrink-0">
                          ₹{Math.round(c.stockValue ?? 0).toLocaleString()} val
                        </span>
                      </div>
                    ));
                  })()}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No products added yet</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          6. INVENTORY ANALYTICS
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-5">
        <SectionHeader icon={BarChart2} title="Inventory Analytics" sub="Real-time stock levels from MongoDB" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Products" value={(inventory?.totalProducts ?? 0).toLocaleString()} />
          <StatCard label="Active (In Stock)" value={(inventory?.activeProducts ?? 0).toLocaleString()} color="text-emerald-400" />
          <StatCard label="Inactive" value={(inventory?.inactiveProducts ?? 0).toLocaleString()} color="text-rose-400" />
          <StatCard label="Out of Stock" value={(inventory?.outOfStock ?? 0).toLocaleString()} color="text-rose-400" />
          <StatCard
            label="Low Stock (≤5)"
            value={(inventory?.lowStock ?? 0).toLocaleString()}
            color={inventory?.lowStock > 0 ? 'text-amber-400' : 'text-white'}
          />
          <StatCard
            label="Inventory Worth"
            value={`₹${Math.round(inventory?.inventoryWorth ?? 0).toLocaleString()}`}
            color="text-indigo-400"
          />
          <StatCard label="Total Units" value={(inventory?.totalUnits ?? 0).toLocaleString()} />
          <StatCard label="Added Today" value={(inventory?.addedToday ?? 0).toLocaleString()} color="text-purple-400" />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          7. PAYMENT ANALYTICS
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-5">
        <SectionHeader icon={CreditCard} title="Payment Analytics" sub="QR & COD payment records from MongoDB" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Total Collected"
            value={`₹${Math.round(payments?.totalCollected ?? 0).toLocaleString()}`}
            color="text-emerald-400"
          />
          <StatCard label="Pending Approval" value={(payments?.pending ?? 0).toLocaleString()} color="text-amber-400" />
          <StatCard label="Approved" value={(payments?.approved ?? 0).toLocaleString()} color="text-emerald-400" />
          <StatCard label="Rejected" value={(payments?.rejected ?? 0).toLocaleString()} color="text-rose-400" />
        </div>

        {/* Payment Method Breakdown */}
        {payments?.byMethod && Object.keys(payments.byMethod).length > 0 && (
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-3">
              Payment Method Breakdown
            </p>
            <div className="flex gap-3 flex-wrap">
              {Object.entries(payments.byMethod).map(([method, stats]: [string, any]) => (
                <div key={method} className="bg-slate-950/60 border border-slate-800 px-4 py-3 rounded-2xl">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">{method.replace('_', ' ')}</p>
                  <p className="text-base font-extrabold text-white">{stats.count} payments</p>
                  <p className="text-[10px] text-emerald-400 font-bold">₹{Math.round(stats.amount ?? 0).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
