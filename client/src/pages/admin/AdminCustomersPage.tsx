import React, { useEffect, useState } from 'react';
import { Users, ShieldAlert, ShieldCheck, Search, Lock, Unlock, TrendingUp, DollarSign, UserPlus } from 'lucide-react';
import { apiService } from '../../services/api';
import { User } from '../../types';
import toast from 'react-hot-toast';

export const AdminCustomersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [analytics, setAnalytics] = useState<any>(null);

  // Block Modal
  const [blockModalUser, setBlockModalUser] = useState<User | null>(null);
  const [blockedReason, setBlockedReason] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiService.getAllUsers();
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load user accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    apiService.getAdminCustomers().then((r) => {
      if (r.data.success) setAnalytics(r.data.data);
    }).catch(() => {});
  }, []);

  const handleBlockUnblock = async (user: User) => {
    if (user.status === 'blocked') {
      // Unblock
      try {
        const res = await apiService.blockUnblockUser(user._id, 'active');
        if (res.data.success) {
          toast.success(`Account for ${user.name} has been unblocked`);
          fetchUsers();
        }
      } catch (err) {
        toast.error('Failed to unblock account');
      }
    } else {
      // Open modal to specify reason
      setBlockModalUser(user);
      setBlockedReason('');
    }
  };

  const confirmBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockModalUser) return;

    try {
      const res = await apiService.blockUnblockUser(blockModalUser._id, 'blocked', blockedReason);
      if (res.data.success) {
        toast.success(`Account for ${blockModalUser.name} blocked`);
        setBlockModalUser(null);
        fetchUsers();
      }
    } catch (err) {
      toast.error('Failed to block account');
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      const res = await apiService.updateUserRole(userId, role);
      if (res.data.success) {
        toast.success(`User role updated to ${role}`);
        fetchUsers();
      }
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search))
  );

  return (
    <div className="space-y-6">
      {/* ── Live Customer Analytics KPI Strip ────────────────────── */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Customers', value: analytics.total?.toLocaleString(), icon: Users, color: 'text-pink-400' },
            { label: "Today's New", value: analytics.today, icon: UserPlus, color: 'text-pink-400' },
            { label: 'This Month', value: analytics.thisMonth, icon: TrendingUp, color: 'text-indigo-400' },
            { label: 'Avg. Spent', value: `₹${Math.round(analytics.avgSpent ?? 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400' },
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

      {/* Top Banner */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" /> Customer & Role Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage customer accounts, grant admin privileges, and enforce account block policy</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search by Name, Email, or Phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Provider</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Registered Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((u) => (
                <tr key={u._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 font-bold text-sm flex items-center justify-center shrink-0 border border-indigo-500/30">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong className="text-white font-bold block">{u.name}</strong>
                        <span className="text-[11px] text-slate-400 block">{u.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      {u.provider || 'password'}
                    </span>
                  </td>

                  <td className="p-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-2.5 py-1 font-bold"
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </td>

                  <td className="p-4">
                    <span
                      className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded border ${
                        u.status === 'blocked'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {u.status === 'blocked' ? 'Blocked' : 'Active'}
                    </span>
                  </td>

                  <td className="p-4 text-slate-400 font-mono text-[11px]">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleBlockUnblock(u)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ml-auto ${
                        u.status === 'blocked'
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-rose-400 hover:text-white'
                      }`}
                    >
                      {u.status === 'blocked' ? (
                        <>
                          <Unlock className="w-3.5 h-3.5" /> <span>Unblock</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" /> <span>Block</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Block Reason Modal */}
      {blockModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={confirmBlock} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" /> Block Account ({blockModalUser.name})
            </h3>
            <p className="text-xs text-slate-400">
              Specify the reason for blocking this user account. The user will be barred from placing orders or logging in.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Reason for Blocking</label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Policy violation or suspicious activity..."
                value={blockedReason}
                onChange={(e) => setBlockedReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setBlockModalUser(null)}
                className="flex-1 bg-slate-800 text-xs font-semibold py-2.5 rounded-xl text-slate-300"
              >
                Cancel
              </button>
              <button type="submit" className="flex-1 bg-rose-600 hover:bg-rose-500 text-xs font-bold py-2.5 rounded-xl text-white">
                Confirm Block
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
