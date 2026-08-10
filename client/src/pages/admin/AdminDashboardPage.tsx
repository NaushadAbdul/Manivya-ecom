import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertTriangle,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Minus,
} from 'lucide-react';
import { apiService } from '../../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardData {
  revenue: {
    lifetime: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    lastMonth: number;
    monthlyGrowthPct: number;
  };
  orders: {
    total: number;
    today: number;
    thisMonth: number;
    lastMonth: number;
    orderGrowthPct: number;
    byStatus: Record<string, number>;
  };
  products: {
    total: number;
    active: number;
    outOfStock: number;
    lowStock: number;
    stockValue: number;
    addedToday: number;
  };
  customers: {
    total: number;
    today: number;
    thisMonth: number;
    lastMonth: number;
    customerGrowthPct: number;
  };
  avgOrderValue: number;
  recentOrders: any[];
  bestSellers: any[];
}

interface MonthlyPoint {
  month: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
  unitsSold: number;
}

// ─── Date Range Presets ────────────────────────────────────────────────────────

const DATE_RANGES = [
  { label: 'Today', value: 'today' },
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' },
] as const;
type DateRangeKey = (typeof DATE_RANGES)[number]['value'];

// ─── Growth Badge ─────────────────────────────────────────────────────────────

const GrowthBadge: React.FC<{ pct: number; suffix?: string }> = ({ pct, suffix = 'vs last month' }) => {
  if (pct === 0) {
    return (
      <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
        <Minus className="w-3 h-3" /> No change {suffix}
      </span>
    );
  }
  const positive = pct > 0;
  return (
    <span
      className={`text-[10px] font-bold flex items-center gap-1 ${
        positive ? 'text-emerald-400' : 'text-rose-400'
      }`}
    >
      {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {positive ? '+' : ''}
      {pct}% {suffix}
    </span>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

const statusColor: Record<string, string> = {
  Confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Preparing: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Packed: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Assigned: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  Shipped: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  'Out for Delivery': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Delivered: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Cancelled: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  Returned: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  Refunded: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

// ─── Main Dashboard Component ─────────────────────────────────────────────────

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<DateRangeKey>('month');

  const fetchDashboard = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const [dashRes, monthlyRes] = await Promise.all([
        apiService.getAdminAnalytics(),
        apiService.getAdminMonthlyRevenue({ year: new Date().getFullYear() }),
      ]);

      if (dashRes.data.success) setData(dashRes.data.data);
      if (monthlyRes.data.success) setMonthlyRevenue(monthlyRes.data.data.monthlyRevenue);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Dashboard analytics error', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => fetchDashboard(), 60_000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  if (loading || !data) {
    return (
      <div className="py-16 text-center text-slate-400">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Loading live analytics from MongoDB Atlas...</p>
      </div>
    );
  }

  // ── Derived values based on selected date range ────────────────────────────
  const revenueDisplay = (() => {
    switch (dateRange) {
      case 'today': return data.revenue.today;
      case '7d': return data.revenue.thisWeek;
      case '30d': return data.revenue.thisMonth;
      case 'month': return data.revenue.thisMonth;
      case 'year': return data.revenue.lifetime;
    }
  })();

  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue), 1);
  const currentYear = new Date().getFullYear();

  // ── Order Status Counts ───────────────────────────────────────────────────
  const statusList = [
    { label: 'Confirmed', icon: Clock, key: 'Confirmed', color: 'text-blue-400' },
    { label: 'Preparing', icon: Package, key: 'Preparing', color: 'text-amber-400' },
    { label: 'Shipped', icon: Truck, key: 'Shipped', color: 'text-indigo-400' },
    { label: 'Delivered', icon: CheckCircle2, key: 'Delivered', color: 'text-emerald-400' },
    { label: 'Cancelled', icon: XCircle, key: 'Cancelled', color: 'text-rose-400' },
  ];

  return (
    <div className="space-y-8">
      {/* ── Header row ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Overview Analytics</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Live data from MongoDB Atlas ·{' '}
            <span className="text-slate-500 font-mono">
              {lastRefreshed.toLocaleTimeString()}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Range Filter */}
          <div className="flex gap-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-1">
            {DATE_RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setDateRange(r.value)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                  dateRange === r.value
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="p-2 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Top KPI Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
            <span>
              {dateRange === 'today'
                ? "Today's Revenue"
                : dateRange === '7d'
                ? 'Weekly Revenue'
                : dateRange === 'year'
                ? 'Lifetime Revenue'
                : 'Monthly Revenue'}
            </span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">₹{revenueDisplay.toLocaleString()}</p>
          <GrowthBadge pct={data.revenue.monthlyGrowthPct} />
        </div>

        {/* Today's Orders */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
            <span>Today's New Orders</span>
            <ShoppingBag className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{data.orders.today}</p>
          <span className="text-[10px] text-indigo-400 font-bold">
            Total All-Time: {data.orders.total.toLocaleString()}
          </span>
        </div>

        {/* Active Products */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
            <span>Active Products</span>
            <Package className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{data.products.active}</p>
          <div className="flex items-center gap-2 flex-wrap">
            {data.products.lowStock > 0 && (
              <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                <AlertTriangle className="w-3 h-3" />
                {data.products.lowStock} low stock
              </span>
            )}
            {data.products.outOfStock > 0 && (
              <span className="text-[10px] text-rose-400 font-bold">
                {data.products.outOfStock} OOS
              </span>
            )}
            {data.products.lowStock === 0 && data.products.outOfStock === 0 && (
              <span className="text-[10px] text-slate-400">All catalog in stock</span>
            )}
          </div>
        </div>

        {/* Registered Customers */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
            <span>Registered Customers</span>
            <Users className="w-4 h-4 text-pink-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{data.customers.total.toLocaleString()}</p>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-pink-400 font-bold">+{data.customers.today} today</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">+{data.customers.thisMonth} this month</span>
          </div>
        </div>
      </div>

      {/* ── Secondary KPI Row — Order Status Breakdown ────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statusList.map(({ label, icon: Icon, key, color }) => (
          <div key={key} className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
            <Icon className={`w-5 h-5 ${color} shrink-0`} />
            <div>
              <p className="text-lg font-extrabold text-white">{(data.orders.byStatus[key] ?? 0).toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 font-semibold">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Inventory Quick Stats ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Total Catalog</p>
          <p className="text-xl font-extrabold text-white">{data.products.total}</p>
          {data.products.addedToday > 0 && (
            <p className="text-[10px] text-indigo-400 font-bold mt-1">+{data.products.addedToday} added today</p>
          )}
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Stock Value</p>
          <p className="text-xl font-extrabold text-white">₹{Math.round(data.products.stockValue).toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-1">Inventory worth</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Avg. Order Value</p>
          <p className="text-xl font-extrabold text-white">₹{Math.round(data.avgOrderValue).toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-1">Per completed order</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">This Month Orders</p>
          <p className="text-xl font-extrabold text-white">{data.orders.thisMonth}</p>
          <GrowthBadge pct={data.orders.orderGrowthPct} suffix="vs last month" />
        </div>
      </div>

      {/* ── Monthly Revenue Bar Chart ─────────────────────────────────────── */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Monthly Sales Performance
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">{currentYear} Fiscal Year · Live from MongoDB Atlas</p>
          </div>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-indigo-600 to-purple-500 inline-block" />
              <span className="text-slate-400">Revenue</span>
            </span>
            <BarChart2 className="w-4 h-4 text-slate-500" />
          </div>
        </div>

        {monthlyRevenue.every((m) => m.revenue === 0) ? (
          <div className="h-48 flex items-center justify-center text-slate-500 text-xs">
            No order revenue recorded for {currentYear} yet
          </div>
        ) : (
          <div className="h-48 flex items-end justify-between gap-1.5 pt-6 px-2 border-b border-slate-800">
            {monthlyRevenue.map((m) => {
              const heightPct = Math.max(Math.round((m.revenue / maxRevenue) * 100), m.revenue > 0 ? 3 : 0);
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-14 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-[10px] whitespace-nowrap z-10 shadow-xl pointer-events-none">
                    <p className="font-bold text-white">₹{(m.revenue / 1000).toFixed(1)}k</p>
                    <p className="text-slate-400">{m.orders} orders · {m.unitsSold} units</p>
                  </div>
                  <div
                    className="w-full bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-lg transition-all group-hover:brightness-125"
                    style={{ height: `${heightPct}%`, minHeight: m.revenue > 0 ? '4px' : '0px' }}
                  />
                  <span className="text-[10px] text-slate-400 font-semibold">{m.month}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Monthly totals summary */}
        <div className="flex gap-4 flex-wrap text-[10px] pt-1">
          <span className="text-slate-400">
            Peak month:{' '}
            <strong className="text-white">
              {monthlyRevenue.find((m) => m.revenue === maxRevenue)?.month ?? '—'}
            </strong>
          </span>
          <span className="text-slate-400">
            Year revenue:{' '}
            <strong className="text-white">
              ₹{monthlyRevenue.reduce((s, m) => s + m.revenue, 0).toLocaleString()}
            </strong>
          </span>
          <span className="text-slate-400">
            Year orders:{' '}
            <strong className="text-white">
              {monthlyRevenue.reduce((s, m) => s + m.orders, 0)}
            </strong>
          </span>
        </div>
      </div>

      {/* ── Recent Orders & Best Sellers ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Orders</h3>
            <Link
              to="/manivya-admin/orders"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              Manage All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {data.recentOrders.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">No orders placed yet</div>
          ) : (
            <div className="space-y-2.5">
              {data.recentOrders.map((o: any) => (
                <div
                  key={o._id}
                  className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl flex justify-between items-center text-xs gap-2"
                >
                  <div className="min-w-0">
                    <h4 className="font-bold text-white">#{o.orderNumber}</h4>
                    <p className="text-[11px] text-slate-400 truncate">
                      {o.user?.name || 'Customer'} ·{' '}
                      <span className="text-white font-semibold">₹{(o.totalAmount || 0).toLocaleString()}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {new Date(o.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap shrink-0 ${
                      statusColor[o.orderStatus] ?? 'bg-slate-700/40 text-slate-400 border-slate-700'
                    }`}
                  >
                    {o.orderStatus}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Best Selling Products */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Best Selling Products
            </h3>
            <Link
              to="/manivya-admin/products"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              Manage Catalog <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {data.bestSellers.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              Best sellers appear once orders are placed
            </div>
          ) : (
            <div className="space-y-2.5">
              {data.bestSellers.map((p: any, idx: number) => (
                <div
                  key={p._id}
                  className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center gap-3 text-xs"
                >
                  {/* Rank */}
                  <span className="text-[10px] font-extrabold text-slate-500 w-4 shrink-0 text-center">
                    #{idx + 1}
                  </span>
                  {/* Image */}
                  {p.images?.[0] ? (
                    <img
                      src={p.images[0]}
                      alt=""
                      className="w-10 h-10 object-cover rounded-xl shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-slate-800 rounded-xl shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white truncate">{p.name || 'Unknown Product'}</h4>
                    <p className="text-[11px] text-slate-400">
                      <span className="text-indigo-400 font-bold">{p.unitsSold} sold</span>
                      {' · '}
                      <span className="text-emerald-400 font-semibold">₹{Math.round(p.revenue).toLocaleString()} rev</span>
                      {' · '}
                      <span className={p.stock <= 5 ? 'text-amber-400' : 'text-slate-400'}>
                        {p.stock} in stock
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Links to Sub-Analytics Pages ────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { to: '/manivya-admin/analytics', label: 'Deep Analytics', sub: 'Revenue · Orders · Customers', color: 'text-indigo-400' },
          { to: '/manivya-admin/orders', label: 'All Orders', sub: `${data.orders.total} total orders`, color: 'text-blue-400' },
          { to: '/manivya-admin/users', label: 'Customers', sub: `${data.customers.total} registered`, color: 'text-pink-400' },
          { to: '/manivya-admin/products', label: 'Products', sub: `${data.products.active} active items`, color: 'text-purple-400' },
        ].map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl hover:border-slate-700 hover:bg-slate-800/60 transition-all group"
          >
            <p className={`text-xs font-bold ${card.color} group-hover:brightness-110 transition-all`}>
              {card.label}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">{card.sub}</p>
            <ArrowUpRight className={`w-3.5 h-3.5 ${card.color} mt-2 opacity-0 group-hover:opacity-100 transition-opacity`} />
          </Link>
        ))}
      </div>
    </div>
  );
};
