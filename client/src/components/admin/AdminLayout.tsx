import React, { useState } from 'react';
import { Link, Outlet, useLocation, Navigate, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FolderTree,
  Tag,
  Users,
  CheckSquare,
  ArrowLeft,
  Truck,
  Activity,
  Menu,
  X,
  LineChart,
  Sparkles,
  LogOut,
  ShieldCheck,
  Palette,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { adminUser, adminToken, user, logoutAdmin, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active Admin Resolution: strictly check dedicated adminUser session
  const activeAdmin = adminUser;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center">
        <div className="space-y-3">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  if (!activeAdmin && !adminToken) {
    return <Navigate to="/manivya-admin/login" replace />;
  }

  const handleAdminLogout = () => {
    logoutAdmin();
    navigate('/manivya-admin/login');
  };

  const navItems = [
    { label: 'Overview Analytics', path: '/manivya-admin', icon: LayoutDashboard },
    { label: 'Analytics Deep Dive', path: '/manivya-admin/analytics', icon: LineChart },
    { label: 'Navbar & Page Theme', path: '/manivya-admin/theme', icon: Palette },
    { label: '3D Hero Categories', path: '/manivya-admin/hero-3d', icon: Sparkles },
    { label: 'Products Catalog', path: '/manivya-admin/products', icon: Package },
    { label: 'Logistics & Fleet', path: '/manivya-admin/logistics', icon: Truck },
    { label: 'Orders & Status', path: '/manivya-admin/orders', icon: ShoppingBag },
    { label: 'QR Payments Moderation', path: '/manivya-admin/payments', icon: CheckSquare },
    { label: 'Login Activity Log', path: '/manivya-admin/activity', icon: Activity },
    { label: 'Categories', path: '/manivya-admin/categories', icon: FolderTree },
    { label: 'Promo Coupons', path: '/manivya-admin/coupons', icon: Tag },
    { label: 'Customers & Roles', path: '/manivya-admin/users', icon: Users },
  ];

  return (
    <div className="min-h-screen text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-black/40 backdrop-blur-xl border-b md:border-b-0 md:border-r border-purple-900/30 p-4 md:p-5 space-y-4 md:space-y-6 shrink-0 flex flex-col justify-between">
        <div className="space-y-4 md:space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 md:pb-4">
            <div className="flex items-center space-x-3">
              <img
                src="/logo-badge.png"
                alt="MANIVYA Badge"
                className="w-10 h-10 object-contain rounded-full shadow-lg shadow-purple-600/20 shrink-0"
              />
              <div>
                <img
                  src="/logo-light.png"
                  alt="MANIVYA Admin"
                  className="h-6 w-auto object-contain"
                />
                <span className="text-[9px] text-purple-400 font-semibold uppercase tracking-widest block -mt-0.5">Control Portal</span>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          <nav className={`space-y-1.5 ${mobileMenuOpen ? 'block' : 'hidden md:block'}`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-600/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom Controls: Active Admin Badge & Admin Logout */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3 hidden md:block">
          <div className="flex items-center space-x-2.5 px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-2xl">
            <div className="w-7 h-7 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
            </div>
            <div className="truncate">
              <span className="text-[11px] font-bold text-white block truncate">{activeAdmin?.name || 'Administrator'}</span>
              <span className="text-[9px] text-emerald-400 font-mono block">Admin Active</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Storefront</span>
            </Link>

            <button
              onClick={handleAdminLogout}
              className="flex items-center space-x-1 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg"
              title="Logout Admin Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Admin</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Admin Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
