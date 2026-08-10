import React, { useState, useEffect } from 'react';
import { UserPlus, ShieldCheck, ShieldAlert, Mail, User as UserIcon, Lock, Phone, Search, CheckCircle2, UserCheck, RefreshCw } from 'lucide-react';
import { apiService } from '../../services/api';
import { User } from '../../types';
import toast from 'react-hot-toast';

export const AdminAddAdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State for Adding New Admin Partner
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filter & Search state for customer promotion section
  const [searchTerm, setSearchTerm] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await apiService.getAllUsers();
      if (res.data && res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load user accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Please provide full name and email address');
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiService.createNewAdminUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password: password.trim() || undefined,
      });

      if (res.data && res.data.success) {
        toast.success(res.data.message || 'Admin Partner access granted successfully!');
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
        loadUsers();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add Admin Partner');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string, userName: string) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    const actionText = newRole === 'admin' ? `grant Admin access to ${userName}` : `revoke Admin access from ${userName}`;

    if (confirm(`Are you sure you want to ${actionText}?`)) {
      try {
        const res = await apiService.updateUserRole(userId, newRole);
        if (res.data.success) {
          toast.success(newRole === 'admin' ? `Admin Partner access granted to ${userName}!` : `Admin access revoked for ${userName}`);
          loadUsers();
        }
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Role update failed');
      }
    }
  };

  const adminUsers = users.filter((u) => u.role === 'admin');
  const customerUsers = users.filter((u) => u.role !== 'admin');

  const filteredCustomers = customerUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Banner Header */}
      <div className="bg-gradient-to-r from-purple-900/40 via-slate-900/60 to-indigo-900/40 border border-purple-500/20 p-6 sm:p-8 rounded-3xl space-y-2 relative overflow-hidden backdrop-blur-xl">
        <div className="flex items-center space-x-3 text-purple-400">
          <ShieldCheck className="w-6 h-6 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-widest">Admin Partner Credentials & Role Delegation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Add an Admin Partner
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          Grant full administrator control to your business partners, co-founders, or managers so they can moderate products, view analytics, dispatch orders, and manage storefront operations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form to Add New Admin Partner */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-3xl space-y-5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800">
              <UserPlus className="w-5 h-5 text-purple-400" />
              <h2 className="text-base font-bold text-white">Add New Admin Partner</h2>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Partner Full Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Partner Email Address <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. partner@manivya.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  If account exists, it will be instantly promoted to Admin Partner.
                </p>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Mobile / Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Password (For Direct Admin Login)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    placeholder="Set admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Leave blank if partner will sign in via Google Auth with their email.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || !name.trim() || !email.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs py-3.5 rounded-xl shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Grant Admin Partner Rights</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Active Admin Roster & Quick Promote Customers */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Admin Partners Roster */}
          <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-2xl backdrop-blur-xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Active Administrator Partners ({adminUsers.length})
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">List of all users with full Control Portal access</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {adminUsers.map((a) => (
                <div key={a._id} className="p-4 bg-slate-950/80 border border-purple-500/20 rounded-2xl space-y-3 relative group hover:border-purple-500/40 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-extrabold text-sm uppercase">
                        {a.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white block">{a.name}</h4>
                        <span className="text-[11px] text-slate-400 font-mono block">{a.email}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ADMIN
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-900">
                    <span>Provider: <strong className="text-indigo-400 font-mono uppercase">{a.provider || 'local'}</strong></span>
                    <button
                      onClick={() => handleToggleRole(a._id, 'admin', a.name)}
                      className="text-rose-400 hover:text-rose-300 font-semibold hover:underline"
                    >
                      Revoke Admin
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Promote Registered Customers */}
          <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-400" />
                  Promote Registered Customer to Admin Partner
                </h3>
                <p className="text-xs text-slate-400">Search existing registered user accounts to upgrade to Admin</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search user email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-400" />
                Loading registered accounts...
              </div>
            ) : filteredCustomers.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No matching registered customers found.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {filteredCustomers.map((c) => (
                  <div key={c._id} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex justify-between items-center text-xs hover:border-slate-700 transition-all">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs uppercase">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-white font-bold block">{c.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{c.email}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleRole(c._id, 'customer', c.name)}
                      className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 font-bold px-3 py-1 rounded-lg transition-all text-[11px] flex items-center space-x-1"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>Promote to Admin</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAddAdminPage;
