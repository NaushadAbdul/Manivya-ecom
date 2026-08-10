import React, { useEffect, useState } from 'react';
import { Activity, Monitor, Smartphone, Search, RefreshCw, Eye, ShoppingBag, Heart, CheckCircle2 } from 'lucide-react';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

export const AdminActivityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'logins' | 'products'>('logins');
  const [activities, setActivities] = useState<any[]>([]);
  const [productActivities, setProductActivities] = useState<any[]>([]);
  const [activeSessions, setActiveSessions] = useState(0);
  const [loginsToday, setLoginsToday] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const [loginRes, prodRes] = await Promise.all([
        apiService.getLoginActivityInfo({ search }),
        apiService.getProductActivities(),
      ]);

      if (loginRes.data.success) {
        setActivities(loginRes.data.data.activities);
        setActiveSessions(loginRes.data.data.activeSessionsCount);
        setLoginsToday(loginRes.data.data.totalLoginsToday);
      }
      if (prodRes.data.success) {
        setProductActivities(prodRes.data.data);
      }
    } catch (err) {
      console.warn('Failed to load audit activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [search]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" /> User Activity & Product Audit Stream
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time audit log of user logins, product views, cart additions, and purchases</p>
        </div>

        <button
          onClick={fetchActivity}
          className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> <span>Refresh Stream</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 font-semibold block">Currently Active Sessions</span>
          <strong className="text-2xl font-extrabold text-emerald-400 mt-1 block">{activeSessions}</strong>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 font-semibold block">Total Logins Today</span>
          <strong className="text-2xl font-extrabold text-indigo-400 mt-1 block">{loginsToday}</strong>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 font-semibold block">Live Product Events</span>
          <strong className="text-2xl font-extrabold text-purple-400 mt-1 block">{productActivities.length} Events</strong>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex border-b border-slate-800 space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('logins')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'logins' ? 'border-indigo-500 text-indigo-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          User Logins & Security Audit
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'products' ? 'border-indigo-500 text-indigo-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Product Interactions Stream ({productActivities.length})
        </button>
      </div>

      {activeTab === 'logins' && (
        <>
          {/* Filter Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Filter by Name, Email, or IP Address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Activity Table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Provider</th>
                    <th className="p-4">Login Time</th>
                    <th className="p-4">IP Address</th>
                    <th className="p-4">Device & OS</th>
                    <th className="p-4">Browser</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/60">
                  {activities.map((act) => (
                    <tr key={act._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div>
                          <strong className="text-white font-bold block">{act.name}</strong>
                          <span className="text-[11px] text-slate-400">{act.email}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                          {act.provider || 'password'}
                        </span>
                      </td>

                      <td className="p-4 font-mono text-[11px]">
                        {new Date(act.loginTime).toLocaleDateString()} • {new Date(act.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      <td className="p-4 font-mono text-slate-400">{act.ipAddress || '127.0.0.1'}</td>

                      <td className="p-4">
                        <div className="flex items-center space-x-1.5">
                          {act.device === 'Mobile' ? <Smartphone className="w-3.5 h-3.5 text-purple-400" /> : <Monitor className="w-3.5 h-3.5 text-indigo-400" />}
                          <span>{act.device} ({act.os})</span>
                        </div>
                      </td>

                      <td className="p-4 text-slate-300">{act.browser}</td>

                      <td className="p-4">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          act.isCurrentSession ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {act.isCurrentSession ? 'Active Session' : 'Logged Out'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'products' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60">
                {productActivities.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">
                      No product interactions recorded yet. Users viewing products will populate here in real-time!
                    </td>
                  </tr>
                ) : (
                  productActivities.map((pa) => (
                    <tr key={pa._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div>
                          <strong className="text-white font-bold block">{pa.userName || 'Guest Visitor'}</strong>
                          <span className="text-[11px] text-slate-400">{pa.userEmail || 'Unauthenticated'}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        {pa.action === 'view' && (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            <Eye className="w-3 h-3" /> Viewed Page
                          </span>
                        )}
                        {pa.action === 'cart_add' && (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                            <ShoppingBag className="w-3 h-3" /> Added to Cart
                          </span>
                        )}
                        {pa.action === 'wishlist_add' && (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-pink-500/20 text-pink-400 border border-pink-500/30">
                            <Heart className="w-3 h-3" /> Added to Wishlist
                          </span>
                        )}
                        {pa.action === 'purchase' && (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Purchased
                          </span>
                        )}
                      </td>

                      <td className="p-4 font-semibold text-white">
                        {pa.productName}
                      </td>

                      <td className="p-4 font-mono text-[11px] text-slate-400">
                        {new Date(pa.timestamp).toLocaleDateString()} • {new Date(pa.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
