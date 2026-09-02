import axios from 'axios';
import { Product, Category, Order, Address, Review, Coupon, PaymentRecord, NotificationItem, Warehouse, DeliveryPartner } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token from localStorage (Dual Admin & Customer token support)
api.interceptors.request.use((config) => {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const reqUrl = config.url || '';

  const adminToken = localStorage.getItem('manivya_admin_token');
  const customerToken = localStorage.getItem('manivya_customer_token') || localStorage.getItem('manivya_token');

  const isAdminEndpoint =
    currentPath.startsWith('/manivya-admin') ||
    currentPath.startsWith('/admin') ||
    reqUrl.includes('/admin') ||
    reqUrl.includes('/payments/pending') ||
    reqUrl.includes('/payments/verify') ||
    reqUrl.includes('/categories/admin') ||
    reqUrl.includes('/orders/admin') ||
    reqUrl.includes('/analytics/') ||
    reqUrl.includes('/logistics/warehouses') ||
    reqUrl.includes('/logistics/partners') ||
    (reqUrl.includes('/hero-3d') && config.method !== 'get') ||
    (reqUrl.includes('/showcase') && config.method !== 'get') ||
    (reqUrl.includes('/theme') && config.method !== 'get') ||
    (reqUrl.includes('/products') && config.method !== 'get') ||
    (reqUrl.includes('/categories') && config.method !== 'get');

  if (isAdminEndpoint && adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (adminToken && !customerToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (customerToken) {
    config.headers.Authorization = `Bearer ${customerToken}`;
  }

  return config;
});

export const apiService = {
  // Auth & Profile
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data: { name?: string; phone?: string; photo?: string }) => api.put('/auth/profile', data),
  deleteAccount: () => api.delete('/auth/delete-account'),
  syncUser: (userData: any) => api.post('/auth/sync', userData),
  getAllUsers: () => api.get('/auth/users'),
  createNewAdminUser: (data: { name: string; email: string; phone?: string; password?: string }) =>
    api.post('/auth/sync', {
      uid: `admin_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      provider: data.password ? 'password' : 'admin_grant',
      isAdminPortal: true,
    }),
  updateUserRole: (userId: string, role: string) => api.patch(`/auth/users/${userId}/role`, { role }),

  // Products
  getProducts: (params?: any) => api.get('/products', { params }),
  getProductBySlugOrId: (identifier: string) => api.get(`/products/${identifier}`),
  createProduct: (formData: FormData | any) => api.post('/products', formData),
  updateProduct: (id: string, data: any) => api.put(`/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  restoreProduct: (id: string) => api.patch(`/products/${id}/restore`),

  // Categories
  getCategories: () => api.get('/categories'),
  getAllCategoriesAdmin: () => api.get('/categories/admin'),
  createCategory: (data: Partial<Category>) => api.post('/categories', data),
  updateCategory: (id: string, data: Partial<Category>) => api.put(`/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/categories/${id}`),

  // Orders
  createOrder: (orderData: any) => api.post('/orders', orderData),
  getMyOrders: () => api.get('/orders/my'),
  getOrderById: (id: string) => api.get(`/orders/${id}`),
  getAllOrdersAdmin: (params?: any) => api.get('/orders/admin/all', { params }),
  updateOrderStatusAdmin: (id: string, status: string, note?: string) => api.patch(`/orders/admin/${id}/status`, { status, note }),

  // Payments & Proof Verification
  uploadPaymentProof: (formData: FormData | any) => api.post('/payments/upload-proof', formData),
  getPendingPaymentsAdmin: () => api.get('/payments/pending'),
  verifyPaymentAdmin: (paymentId: string, action: 'approve' | 'reject', rejectionReason?: string) => api.patch(`/payments/verify/${paymentId}`, { action, rejectionReason }),
  createRazorpayOrder: (amount: number, orderId?: string) => api.post('/payments/razorpay/create-order', { amount, orderId }),
  verifyRazorpayPayment: (paymentData: any) => api.post('/payments/razorpay/verify', paymentData),

  // Addresses & Geo Location
  getAddresses: () => api.get('/addresses'),
  createAddress: (data: Partial<Address>) => api.post('/addresses', data),
  updateAddress: (id: string, data: Partial<Address>) => api.put(`/addresses/${id}`, data),
  deleteAddress: (id: string) => api.delete(`/addresses/${id}`),
  setDefaultAddress: (id: string) => api.patch(`/addresses/${id}/default`),
  calculateShippingFee: (latitude?: number, longitude?: number, subtotal: number = 0) => api.post('/addresses/calculate-shipping', { latitude, longitude, subtotal }),

  // Reviews
  getProductReviews: (productId: string) => api.get(`/reviews/product/${productId}`),
  createReview: (data: any) => api.post('/reviews', data),
  likeReview: (reviewId: string) => api.patch(`/reviews/${reviewId}/like`),

  // Coupons
  validateCoupon: (code: string, subtotal: number) => api.post('/coupons/validate', { code, subtotal }),
  getCouponsAdmin: () => api.get('/coupons/admin'),
  createCouponAdmin: (data: Partial<Coupon>) => api.post('/coupons/admin', data),
  deleteCouponAdmin: (id: string) => api.delete(`/coupons/admin/${id}`),

  // AI Recommendations
  getPersonalizedRecommendations: (limit?: number) => api.get('/recommendations/personalized', { params: { limit } }),
  getRelatedProducts: (productId: string, limit?: number) => api.get(`/recommendations/related/${productId}`, { params: { limit } }),

  // Notifications
  getNotifications: () => api.get('/notifications'),
  markNotificationRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllNotificationsRead: () => api.patch('/notifications/read-all'),

  // Analytics — all admin-protected endpoints powered by MongoDB aggregations
  getAdminAnalytics: () => api.get('/analytics/dashboard'),
  getAdminMonthlyRevenue: (params?: { year?: number }) => api.get('/analytics/monthly-revenue', { params }),
  getAdminRevenue: (params?: { from?: string; to?: string }) => api.get('/analytics/revenue', { params }),
  getAdminOrders: (params?: { from?: string; to?: string }) => api.get('/analytics/orders', { params }),
  getAdminCustomers: () => api.get('/analytics/customers'),
  getAdminProducts: () => api.get('/analytics/products'),
  getAdminCategories: () => api.get('/analytics/categories'),
  getAdminInventory: () => api.get('/analytics/inventory'),
  getAdminPaymentAnalytics: (params?: { from?: string; to?: string }) => api.get('/analytics/payments', { params }),

  // Logistics & Delivery Module
  getTrackingInfo: (identifier: string) => api.get(`/logistics/track/${identifier}`),
  getWarehouses: () => api.get('/logistics/warehouses'),
  createWarehouse: (data: Partial<Warehouse>) => api.post('/logistics/warehouses', data),
  deleteWarehouse: (id: string) => api.delete(`/logistics/warehouses/${id}`),
  getDeliveryPartners: () => api.get('/logistics/partners'),
  createDeliveryPartner: (data: Partial<DeliveryPartner>) => api.post('/logistics/partners', data),
  deleteDeliveryPartner: (id: string) => api.delete(`/logistics/partners/${id}`),
  assignWarehouseToOrder: (orderId: string, warehouseId: string) => api.post(`/logistics/orders/${orderId}/assign-warehouse`, { warehouseId }),
  assignPartnerToOrder: (orderId: string, partnerId: string) => api.post(`/logistics/orders/${orderId}/assign-partner`, { partnerId }),
  updateLogisticsStatus: (orderId: string, status: string, note?: string) => api.patch(`/logistics/orders/${orderId}/status`, { status, note }),

  // Login & Product Activity Tracking
  getLoginActivityInfo: (params?: any) => api.get('/activity/login-activity', { params }),
  logProductActivity: (productId: string, action: 'view' | 'cart_add' | 'wishlist_add' | 'purchase') =>
    api.post('/activity/product', { productId, action }),
  getProductActivities: () => api.get('/activity/products'),
  blockUnblockUser: (userId: string, status: 'active' | 'blocked', blockedReason?: string) =>
    api.patch(`/auth/users/${userId}/block`, { status, blockedReason }),
  cancelOrder: (orderId: string, reason?: string) => api.post(`/orders/${orderId}/cancel`, { reason }),

  // Hero Showcase Slides (admin configurable)
  getShowcase: () => api.get('/showcase'),
  updateShowcase: (slides: any[]) => api.put('/showcase', { slides }),

  // 3D Category Hero (admin configurable)
  getHero3D: () => api.get('/hero-3d'),
  getAllHero3DAdmin: () => api.get('/hero-3d/admin'),
  createHero3D: (data: any) => api.post('/hero-3d', data),
  updateHero3D: (id: string, data: any) => api.put(`/hero-3d/${id}`, data),
  deleteHero3D: (id: string) => api.delete(`/hero-3d/${id}`),

  // Dynamic Theme & Navbar Background Manager
  getTheme: () => api.get('/theme'),
  updateTheme: (data: any) => api.put('/theme', data),
};

export default api;
