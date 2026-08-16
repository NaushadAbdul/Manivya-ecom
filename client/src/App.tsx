import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LocationProvider } from './context/LocationContext';

// Common Layout
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { AIChatbot } from './components/common/AIChatbot';
import { SplashScreen } from './components/common/SplashScreen';

// Customer Storefront Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { CustomerProfilePage } from './pages/CustomerProfilePage';
import { AuthPage } from './pages/AuthPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Admin Management Portal Pages
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminLogisticsPage } from './pages/admin/AdminLogisticsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminActivityPage } from './pages/admin/AdminActivityPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminCouponsPage } from './pages/admin/AdminCouponsPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import AdminShowcasePage from './pages/admin/AdminShowcasePage';
import { AdminHero3DPage } from './pages/admin/AdminHero3DPage';
import { AdminThemePage } from './pages/admin/AdminThemePage';

// ── Storefront wrapper with splash screen support ──
const StorefrontLayout: React.FC<{ splashDone: boolean; onSplashComplete: () => void }> = ({
  splashDone,
  onSplashComplete,
}) => {
  const location = useLocation();
  const isHomepage = location.pathname === '/';
  const showSplash = !splashDone && isHomepage;

  return (
    <>
      {/* Splash overlay — only on homepage, only once per session */}
      {showSplash && <SplashScreen onComplete={onSplashComplete} />}

      {/* Main site shell — initially hidden behind splash, then slides in */}
      <div
        className="flex flex-col min-h-screen"
        style={{
          opacity: showSplash ? 0 : 1,
          transform: showSplash ? 'translateY(40px)' : 'translateY(0)',
          transition: 'opacity 1.2s cubic-bezier(0.22, 1, 0.36, 1), transform 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:identifier" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders/:id" element={<OrderTrackingPage />} />
            <Route path="/profile" element={<CustomerProfilePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </>
  );
};

export const App: React.FC = () => {
  // Once splash finishes, it never plays again for the session
  const [splashDone, setSplashDone] = useState(() => {
    // Only show splash once per browser session
    return sessionStorage.getItem('manivya_splash_done') === '1';
  });

  const handleSplashComplete = useCallback(() => {
    setSplashDone(true);
    sessionStorage.setItem('manivya_splash_done', '1');
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider>
          <CartProvider>
            <Toaster position="top-right" toastOptions={{ style: { background: '#131B2E', color: '#fff', border: '1px solid #2A3654' } }} />
            
            {/* Sticky Global AI Chatbot Concierge - Visible Everywhere */}
            <AIChatbot />

            <Routes>
              {/* Dedicated Admin Login Route */}
              <Route path="/manivya-admin/login" element={<AdminLoginPage />} />

              {/* Isolated Secure Admin Portal Routes */}
              <Route path="/manivya-admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="logistics" element={<AdminLogisticsPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="payments" element={<AdminPaymentsPage />} />
                <Route path="activity" element={<AdminActivityPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="coupons" element={<AdminCouponsPage />} />
                <Route path="users" element={<AdminCustomersPage />} />
                <Route path="analytics" element={<AdminAnalyticsPage />} />
                <Route path="hero-3d" element={<AdminHero3DPage />} />
                <Route path="theme" element={<AdminThemePage />} />
              </Route>

              {/* Legacy /admin redirect guard */}
              <Route path="/admin/*" element={<Navigate to="/manivya-admin/login" replace />} />

              {/* Storefront Customer Layout with Splash */}
              <Route
                path="*"
                element={
                  <StorefrontLayout
                    splashDone={splashDone}
                    onSplashComplete={handleSplashComplete}
                  />
                }
              />
            </Routes>
          </CartProvider>
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
