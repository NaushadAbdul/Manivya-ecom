import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { User, Package, MapPin, Bell, Settings, LogOut, ExternalLink, ShoppingBag, Trash2, AlertTriangle, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';
import { apiService } from '../services/api';
import { Order, NotificationItem } from '../types';

export const CustomerProfilePage: React.FC = () => {
  const { user, updateUserProfile, deleteAccount, logout } = useAuth();
  const { addToCart } = useCart();
  const { savedAddresses, deleteSavedAddress } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeTab = searchParams.get('tab') || 'orders';

  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [phoneInput, setPhoneInput] = useState(user?.phone || '');

  // Cancel Order Modal State
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Delete Account Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    if (user) {
      apiService.getMyOrders().then((res) => {
        if (res.data.success) {
          // Filter out cancelled orders so cancelled items are removed from My Orders section
          const activeOnly = res.data.data.filter((o: Order) => o.orderStatus !== 'Cancelled');
          setOrders(activeOnly);
        }
      });
      apiService.getNotifications().then((res) => {
        if (res.data.success) setNotifications(res.data.data);
      });
    }
  }, [user]);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name: nameInput, phone: phoneInput });
  };

  const handleDeleteAccountConfirm = async () => {
    try {
      setIsDeletingAccount(true);
      await deleteAccount();
      setShowDeleteModal(false);
      navigate('/');
    } catch (err) {
      // Toast handles error display
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancellingOrder) return;
    try {
      setIsCancelling(true);
      const res = await apiService.cancelOrder(
        cancellingOrder._id,
        cancelReason.trim() || 'Customer requested order cancellation'
      );
      if (res.data.success) {
        toast.success(`Order #${cancellingOrder.orderNumber} cancelled and removed from your active orders.`);
        // Remove cancelled order from user's my orders section
        setOrders((prev) => prev.filter((o) => o._id !== cancellingOrder._id));
        setCancellingOrder(null);
        setCancelReason('');
      } else {
        toast.error(res.data.message || 'Failed to cancel order.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error cancelling order.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Please Login</h2>
        <p className="text-xs text-slate-400">Log in to view your profile dashboard and active orders.</p>
        <Link to="/auth" className="inline-block bg-indigo-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl">
          Login Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Customer Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-xl shadow-indigo-600/30">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">{user.name}</h1>
            <p className="text-xs text-slate-400">{user.email}</p>
            <span className="inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              {user.role} Account
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/auth');
          }}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

      {/* Portal Tabs Navigation */}
      <div className="flex border-b border-slate-800 space-x-6 text-xs font-semibold overflow-x-auto no-scrollbar whitespace-nowrap">
        <Link
          to="/profile?tab=orders"
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'orders' ? 'border-indigo-500 text-indigo-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Orders ({orders.length})</span>
        </Link>

        <Link
          to="/profile?tab=addresses"
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'addresses' ? 'border-indigo-500 text-indigo-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Addresses ({savedAddresses.length})</span>
        </Link>

        <Link
          to="/profile?tab=notifications"
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'notifications' ? 'border-indigo-500 text-indigo-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications ({notifications.length})</span>
        </Link>

        <Link
          to="/profile?tab=settings"
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'settings' ? 'border-indigo-500 text-indigo-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </Link>
      </div>

      {/* Tab Content Display */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <p className="text-xs text-slate-400 py-10 text-center bg-slate-900/40 rounded-3xl border border-slate-800">
              No orders placed yet. Explore the shop catalog to place your first order!
            </p>
          ) : (
            orders.map((o) => {
              const isCancellable = ['Confirmed', 'Preparing', 'Packed', 'Assigned'].includes(o.orderStatus);
              const isCancelled = o.orderStatus === 'Cancelled';

              return (
                <div key={o._id} className="p-5 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-4 hover:border-slate-700/80 transition-all">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white">Order #{o.orderNumber}</span>
                      <span className="text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`font-bold px-2.5 py-1 rounded-md border text-xs ${
                          isCancelled
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                            : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                        }`}
                      >
                        {o.orderStatus}
                      </span>

                      {/* Dustbin Cancel Button */}
                      {isCancellable && (
                        <button
                          onClick={() => setCancellingOrder(o)}
                          title="Cancel Order"
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-600/30 text-rose-400 hover:text-white rounded-lg border border-rose-500/30 transition-all flex items-center space-x-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-[11px] font-bold hidden sm:inline">Cancel</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 border-t border-b border-slate-800/80 py-3">
                    <div className="flex -space-x-3 overflow-hidden">
                      {o.items.map((item, idx) => (
                        <img
                          key={idx}
                          src={item.image}
                          alt=""
                          className="inline-block h-12 w-12 rounded-xl object-cover ring-2 ring-slate-900"
                        />
                      ))}
                    </div>
                    <div className="text-xs">
                      <p className="font-bold text-white">{o.items.length} items total</p>
                      <p className="text-slate-400">Total: ₹{o.totalAmount.toLocaleString()} ({o.paymentMethod.toUpperCase()})</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[11px] text-slate-400">Track ID: {o.trackingNumber}</span>
                    <Link
                      to={`/orders/${o._id}`}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      Live Track Timeline <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}

          {/* Cancel Order Confirmation Modal */}
          {cancellingOrder && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative animate-scale">
                <button
                  onClick={() => {
                    setCancellingOrder(null);
                    setCancelReason('');
                  }}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center space-x-3 text-rose-400">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Cancel Order #{cancellingOrder.orderNumber}</h3>
                    <p className="text-xs text-slate-400">Are you sure you want to cancel this order?</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <label className="font-semibold text-slate-300 block">Reason for Cancellation (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Tell us why you want to cancel (e.g. ordered by mistake, change of address)..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                  />
                  <p className="text-[11px] text-emerald-400 font-semibold">
                    ✓ Cancelling will automatically restore product inventory stock.
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    onClick={() => {
                      setCancellingOrder(null);
                      setCancelReason('');
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all"
                  >
                    Keep Order
                  </button>
                  <button
                    onClick={handleCancelOrder}
                    disabled={isCancelling}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 shadow-lg shadow-rose-600/30"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'addresses' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {savedAddresses.map((addr) => (
            <div key={addr._id} className="p-5 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded">
                  {addr.type}
                </span>
                <button
                  onClick={() => addr._id && deleteSavedAddress(addr._id)}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Delete
                </button>
              </div>
              <h4 className="text-xs font-bold text-white">{addr.name}</h4>
              <p className="text-xs text-slate-300">{addr.fullAddress}</p>
              <p className="text-[11px] text-slate-400">{addr.city}, {addr.state} - {addr.postalCode}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <p className="text-xs text-slate-400 py-10 text-center bg-slate-900/40 rounded-3xl border border-slate-800">
              No notifications yet.
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white">{n.title}</h4>
                  <p className="text-xs text-slate-300">{n.message}</p>
                  <span className="text-[10px] text-slate-500 block">{new Date(n.createdAt).toLocaleString()}</span>
                </div>
                {n.link && (
                  <Link
                    to={n.link}
                    className="text-xs font-semibold text-indigo-400 hover:underline shrink-0"
                  >
                    View
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-md space-y-6">
          <form onSubmit={handleProfileSave} className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Account Information</h3>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Full Name</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Phone Number</label>
              <input
                type="text"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all"
            >
              Save Profile Updates
            </button>
          </form>

          {/* Danger Zone */}
          <div className="bg-rose-950/20 border border-rose-900/40 p-6 rounded-3xl space-y-3">
            <h3 className="text-sm font-extrabold text-rose-400 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Danger Zone
            </h3>
            <p className="text-xs text-slate-400">
              Deleting your account will permanently erase your profile, saved addresses, cart items, and stored credentials.
            </p>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="w-full bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete My Account</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Permanently Delete Account?</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <div className="bg-rose-950/30 border border-rose-900/50 p-3.5 rounded-2xl text-xs text-slate-300 space-y-1.5">
              <p className="font-semibold text-rose-300">What happens when you delete your account:</p>
              <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                <li>Your profile and login access will be permanently destroyed.</li>
                <li>Saved delivery addresses and active shopping cart will be wiped.</li>
                <li>You will be automatically logged out across all devices.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all"
              >
                Keep My Account
              </button>
              <button
                type="button"
                onClick={handleDeleteAccountConfirm}
                disabled={isDeletingAccount}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 shadow-lg shadow-rose-600/30"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeletingAccount ? 'Deleting...' : 'Yes, Delete Account'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
