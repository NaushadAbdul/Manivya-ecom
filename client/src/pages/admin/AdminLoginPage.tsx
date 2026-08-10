import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, Chrome, ArrowRight, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const AdminLoginPage: React.FC = () => {
  const { adminUser, user, loginAdminWithEmail, loginAdminWithGoogle, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('naushadabdul2006@gmail.com');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const fillQuickAdmin = () => {
    setEmail('admin@manivya.com');
    setPassword('admin123');
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
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 text-center space-y-6">
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30 text-white">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">MANIVYA Admin Portal</h1>
          <p className="text-xs text-slate-400">Secure Access for Platform Management & System Operations</p>
        </div>

        {/* Quick Demo Fill Button — Exclusive to Admin Control Portal */}
        <div className="bg-slate-950/60 border border-slate-800 p-2 rounded-2xl flex justify-center">
          <button
            type="button"
            onClick={fillQuickAdmin}
            className="w-full bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 text-xs font-bold py-2.5 px-4 rounded-xl border border-purple-500/40 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/10 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Demo Admin</span>
          </button>
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

        {/* Email Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Administrator Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="admin@manivya.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2"
          >
            <span>Authenticate Admin Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[10px] uppercase font-bold text-slate-500 absolute">OR</span>
        </div>

        {/* Google Admin Auth */}
        <button
          type="button"
          onClick={handleGoogleAdminLogin}
          disabled={loading}
          className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2"
        >
          <Chrome className="w-4 h-4 text-indigo-400" />
          <span>Sign In with Verified Google Workspace</span>
        </button>

        <p className="text-[10px] text-slate-500 text-center">
          Restricted System • IP & Session activity logged for security compliance.
        </p>
      </div>
    </div>
  );
};
