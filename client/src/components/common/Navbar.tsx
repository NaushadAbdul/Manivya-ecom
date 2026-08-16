import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  User as UserIcon,
  Search,
  Menu,
  X,
  Bell,
  SlidersHorizontal,
  Package,
  LogOut,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { apiService } from '../../services/api';
import { NotificationItem, SiteTheme } from '../../types';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [theme, setTheme] = useState<SiteTheme | null>(null);

  const fetchTheme = () => {
    apiService
      .getTheme()
      .then((res) => {
        if (res.data && res.data.success && res.data.data) {
          const t: SiteTheme = res.data.data;
          setTheme(t);

          // Apply page background to body seamlessly
          if (t.bgType === 'image' && t.bgImage) {
            document.body.style.background = `url(${t.bgImage}) center/cover fixed no-repeat`;
          } else if (t.bgType === 'color' && t.bgColor) {
            document.body.style.background = t.bgColor;
          } else if (t.bgGradient) {
            document.body.style.background = t.bgGradient;
          }
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchTheme();
    window.addEventListener('themeUpdated', fetchTheme);
    return () => window.removeEventListener('themeUpdated', fetchTheme);
  }, []);

  useEffect(() => {
    if (user) {
      apiService
        .getNotifications()
        .then((res) => {
          if (res.data.success) {
            setNotifications(res.data.data);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navAccentColor = theme?.navbarAccentColor || '#fbbf24';
  const navTextColor = theme?.navbarTextColor || '#ffffff';

  const navbarStyle: React.CSSProperties = theme
    ? {
        background:
          theme.navbarBgType === 'image' && theme.navbarBgImage
            ? `url(${theme.navbarBgImage}) center/cover no-repeat`
            : theme.navbarBgType === 'color'
            ? theme.navbarBgColor
            : theme.navbarBgGradient || 'linear-gradient(90deg, #1c0d06 0%, #2d140a 50%, #140803 100%)',
        color: navTextColor,
      }
    : {};

  return (
    <header
      style={navbarStyle}
      className="sticky top-0 z-50 bg-gradient-to-r from-[#1c0d06] via-[#2d140a] to-[#140803] border-b border-[#4d2511]/50 shadow-2xl transition-all select-none"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Left Side: Back Button + Logo & Brand Name */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Universal Back Button */}
          {location.pathname !== '/' && (
            <button
              onClick={handleGoBack}
              className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 active:scale-95 text-slate-100 px-3 py-1.5 rounded-xl border border-white/15 backdrop-blur-md transition-all shadow-md text-xs font-bold group cursor-pointer"
              title="Go back to previous page"
              style={{ color: navTextColor }}
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" style={{ color: navAccentColor }} />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}

          <Link to="/" className="flex items-center space-x-3 group shrink-0">
            <div className="p-1 rounded-xl bg-white/5 border border-white/10 group-hover:border-amber-500/50 transition-colors shadow-lg">
              <img
                src="/logo-badge.png"
                alt="MANIVYA Logo"
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-lg group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <img
                  src="/logo-light.png"
                  alt="MANIVYA ENTERPRISES"
                  className="h-5 sm:h-6 w-auto object-contain group-hover:opacity-90 transition-opacity"
                />
              </div>
              <span className="text-[9px] tracking-widest font-black uppercase -mt-0.5" style={{ color: navAccentColor }}>
                ENTERPRISES
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-lg relative items-center">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search premium gadgets, fashion, home essentials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#150a04]/90 border border-amber-900/40 focus:border-amber-500/80 rounded-xl px-4 py-2 pl-9 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <button
              type="submit"
              className="absolute right-1 top-1 text-white text-[11px] font-bold px-3 py-1 rounded-lg transition-colors shadow-md"
              style={{ backgroundColor: navAccentColor }}
            >
              Search
            </button>
          </div>
        </form>

        {/* Center-Right: Catalog & My Orders / My Products Beside Search Bar */}
        <div className="hidden lg:flex items-center space-x-2 shrink-0">
          <button
            onClick={(e) => {
              e.preventDefault();
              const catalogEl = document.getElementById('catalog-section');
              if (catalogEl) {
                catalogEl.scrollIntoView({ behavior: 'smooth' });
              } else {
                navigate('/?scroll=catalog');
                setTimeout(() => {
                  document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="flex items-center space-x-1.5 text-xs font-bold px-3 py-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            style={{ color: navTextColor }}
          >
            <SlidersHorizontal className="w-4 h-4" style={{ color: navAccentColor }} />
            <span>Catalog</span>
          </button>

          <Link
            to={user ? "/profile?tab=orders" : "/auth"}
            className="flex items-center space-x-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/15 px-3.5 py-1.5 rounded-xl transition-all shadow-sm group"
            title="View My Orders & Products"
            style={{ color: navTextColor }}
          >
            <Package className="w-4 h-4 group-hover:scale-110 transition-transform" style={{ color: navAccentColor }} />
            <span>My Orders</span>
          </Link>
        </div>

        {/* Right Side Action Icons: Cart, Profile & Notifications */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Shopping Cart Icon with Badge */}
          <Link
            to="/cart"
            className="relative p-2 text-slate-200 hover:text-white hover:bg-white/10 rounded-xl transition-all flex items-center justify-center"
            title="View Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" style={{ color: navAccentColor }} />
            {totalItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-white text-slate-950 font-black text-[11px] min-w-[20px] h-[20px] px-1 rounded-full flex items-center justify-center border-2 border-slate-950 shadow-lg leading-none transition-transform group-hover:scale-110">
                {totalItemsCount}
              </span>
            )}
          </Link>

          {/* Profile / Account Icon */}
          <Link
            to={user ? "/profile" : "/auth"}
            className="flex items-center space-x-1.5 p-2 hover:bg-white/10 rounded-xl transition-all border border-white/15 bg-white/5"
            title={user ? `Profile (${user.name})` : "Sign In / Profile"}
            style={{ color: navTextColor }}
          >
            <UserIcon className="w-5 h-5" style={{ color: navAccentColor }} />
            <span className="hidden xl:inline text-xs font-bold">
              {user ? (user.name.split(' ')[0] || 'Profile') : 'Profile'}
            </span>
          </Link>

          {/* Notifications Dropdown */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 text-slate-200 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                title="Notifications"
              >
                <Bell className="w-5 h-5" style={{ color: navAccentColor }} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold text-white">Notifications</h4>
                    <span className="text-[10px] text-indigo-400">{unreadCount} unread</span>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center">No notifications yet</p>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n._id}
                          className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50 text-xs"
                        >
                          <p className="font-semibold text-slate-200">{n.title}</p>
                          <p className="text-slate-400 mt-0.5">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-200 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#180b05] border-b border-amber-900/40 p-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#100603] border border-amber-900/40 rounded-xl px-4 py-2 text-xs text-slate-200 placeholder-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </form>

          <div className="flex flex-col space-y-2 pt-1">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                const catalogEl = document.getElementById('catalog-section');
                if (catalogEl) {
                  catalogEl.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('/?scroll=catalog');
                  setTimeout(() => {
                    document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
              className="px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 rounded-lg flex items-center space-x-2 text-left cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-amber-400" />
              <span>Catalog</span>
            </button>
            <Link
              to={user ? "/profile" : "/auth"}
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 rounded-lg flex items-center space-x-2"
            >
              <UserIcon className="w-4 h-4 text-indigo-400" />
              <span>{user ? `Profile (${user.name.split(' ')[0]})` : 'My Profile Account'}</span>
            </Link>
            <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>View Cart</span>
              </div>
              {totalItemsCount > 0 && (
                <span className="bg-indigo-600 text-white text-[11px] font-black min-w-[20px] h-[20px] px-1.5 rounded-full flex items-center justify-center leading-none shadow-md">
                  {totalItemsCount}
                </span>
              )}
            </Link>
            <Link
              to={user ? "/profile?tab=orders" : "/auth"}
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-xs font-bold text-indigo-300 hover:bg-white/10 rounded-lg flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20"
            >
              <Package className="w-4 h-4 text-indigo-400" />
              <span>My Orders</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
