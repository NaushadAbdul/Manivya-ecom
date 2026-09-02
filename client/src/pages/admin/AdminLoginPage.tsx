import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, User, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const AdminLoginPage: React.FC = () => {
  const { adminUser, user, loginAdminWithEmail, loginAdminWithGoogle, loading } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const fillQuickAdmin = () => {
    setEmail('admin@manivya.com');
    setPassword('admin123');
    setIsRegister(false);
    setErrorMsg('');
    setUnverifiedEmail(null);
  };

  // If already logged in as admin, redirect directly to admin dashboard
  React.useEffect(() => {
    const activeAdmin = adminUser || (user?.role === 'admin' ? user : null);
    if (activeAdmin) {
      navigate('/manivya-admin', { replace: true });
    }
  }, [adminUser, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setUnverifiedEmail(null);

    try {
      await loginAdminWithEmail(email, password);
      navigate('/manivya-admin', { replace: true });
    } catch (err: any) {
      if (err.message && err.message.startsWith('EMAIL_NOT_VERIFIED:')) {
        const mail = err.message.split('EMAIL_NOT_VERIFIED:')[1] || email;
        setUnverifiedEmail(mail);
      } else {
        setErrorMsg(err.message || 'Admin authentication failed');
      }
    }
  };

  const handleGoogleAdminLogin = async () => {
    setErrorMsg('');
    setUnverifiedEmail(null);
    try {
      await loginAdminWithGoogle();
      navigate('/manivya-admin', { replace: true });
    } catch (err: any) {
      setErrorMsg(err.message || 'Google authentication failed');
    }
  };

  if (unverifiedEmail) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 space-y-6">
        <div className="bg-slate-900/90 border border-slate-800 p-8 rounded-3xl text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
            <Mail className="w-8 h-8" />
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-extrabold text-white">Email Verification Required</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              We have sent you a verification email to <strong className="text-white">{unverifiedEmail}</strong>. Please verify it and log in.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setUnverifiedEmail(null);
                setErrorMsg('');
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-2xl transition-all shadow-lg shadow-indigo-600/30"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      {/* Top Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30 text-white">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">MANIVYA Admin Portal</h1>
        <p className="text-xs text-slate-400">
          {isRegister ? 'Create New Administrator Account' : 'Secure Access for Platform Management & System Operations'}
        </p>
      </div>



      {/* Error Alert Box */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 text-rose-400 text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block">Authorization Notice</strong>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Main Authentication Card */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl space-y-5 shadow-2xl">
        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          {isRegister && (
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Administrator Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 pl-9 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-all"
                  autoComplete="off"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                name="admin_email_no_autofill"
                autoComplete="off"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 pl-9 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-all"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                name="admin_pass_no_autofill"
                autoComplete="new-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 pl-9 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-all"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs py-3 rounded-2xl shadow-xl shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : (isRegister ? 'Create Admin Account' : 'Sign In as Admin')}
          </button>
        </form>

        {/* Quick Admin Demo Fill & Auto-Login Option */}
        <div className="pt-2 border-t border-slate-800 space-y-3">
          <button
            type="button"
            onClick={fillQuickAdmin}
            className="w-full bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/30 hover:border-indigo-400 text-indigo-300 text-xs py-2.5 px-4 rounded-2xl font-semibold transition-all flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Fill Admin Credentials (admin@manivya.com)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
