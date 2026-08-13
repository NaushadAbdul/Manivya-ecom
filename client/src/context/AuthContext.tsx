import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { User } from '../types';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  adminUser: User | null;
  adminToken: string | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginAdminWithEmail: (email: string, pass: string) => Promise<void>;
  loginAdminWithGoogle: () => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  logout: () => void;
  logoutAdmin: () => void;
  updateUserProfile: (data: { name?: string; phone?: string; photo?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Storefront Customer Auth Session (Loaded directly from customer keys)
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('manivya_customer_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('manivya_customer_token') || localStorage.getItem('manivya_token');
  });

  // Dedicated Isolated Admin Portal Auth Session (Loaded directly from admin keys)
  const [adminUser, setAdminUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('manivya_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('manivya_admin_token');
  });

  const [loading, setLoading] = useState<boolean>(true);

  // Background Token Sync (Matches active firebaseUser strictly by Provider UID / Email)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (!firebaseUser) {
        setLoading(false);
        return;
      }

      const savedCustomerRaw = localStorage.getItem('manivya_customer_user');
      const savedCustomerToken = localStorage.getItem('manivya_customer_token');
      const savedAdminRaw = localStorage.getItem('manivya_admin_user');
      const savedAdminToken = localStorage.getItem('manivya_admin_token');

      // 1. Refresh Customer token ONLY if firebaseUser matches saved Customer session identity
      if (savedCustomerRaw && savedCustomerToken) {
        try {
          const savedCustomer = JSON.parse(savedCustomerRaw);
          const isCustomerMatch =
            firebaseUser.uid === savedCustomer.uid ||
            (firebaseUser.email &&
              firebaseUser.email.toLowerCase().trim() === savedCustomer.email?.toLowerCase().trim());

          if (isCustomerMatch) {
            const idToken = await firebaseUser.getIdToken();
            localStorage.setItem('manivya_customer_token', idToken);
            setToken(idToken);
          }
        } catch (e) {}
      }

      // 2. Refresh Admin token ONLY if firebaseUser matches saved Admin session identity
      if (savedAdminRaw && savedAdminToken) {
        try {
          const savedAdmin = JSON.parse(savedAdminRaw);
          const isAdminMatch =
            firebaseUser.uid === savedAdmin.uid ||
            (firebaseUser.email &&
              firebaseUser.email.toLowerCase().trim() === savedAdmin.email?.toLowerCase().trim());

          if (isAdminMatch) {
            const idToken = await firebaseUser.getIdToken();
            localStorage.setItem('manivya_admin_token', idToken);
            setAdminToken(idToken);
          }
        } catch (e) {}
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ── Customer Storefront Login Methods ──
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const email = result.user.email || '';

      let userData: User = {
        _id: result.user.uid,
        uid: result.user.uid,
        name: result.user.displayName || email.split('@')[0] || 'Valued Customer',
        email,
        photo: result.user.photoURL || '',
        provider: 'google.com',
        role: 'customer',
        status: 'active',
        loginCount: 1,
        totalSpent: 0,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      } as any;

      try {
        const syncRes = await apiService.syncUser({
          uid: result.user.uid,
          name: result.user.displayName || email.split('@')[0] || 'Valued Customer',
          email,
          photo: result.user.photoURL || '',
          provider: 'google.com',
          isAdminPortal: false,
        });
        if (syncRes.data.success) {
          userData = syncRes.data.data;
        }
      } catch (err) {}

      localStorage.setItem('manivya_customer_token', idToken);
      localStorage.setItem('manivya_customer_user', JSON.stringify(userData));
      setToken(idToken);
      setUser(userData);

      toast.success(`Welcome, ${userData.name}!`);
    } catch (err: any) {
      toast.error(err.message || 'Google Sign-In failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, pass);
      const userEmail = result.user.email || email;

      if (!result.user.emailVerified) {
        try {
          await sendEmailVerification(result.user);
        } catch (e) {}
        await signOut(auth).catch(() => {});
        localStorage.removeItem('manivya_customer_token');
        localStorage.removeItem('manivya_customer_user');
        setToken(null);
        setUser(null);

        const unverifiedErr = new Error(`EMAIL_NOT_VERIFIED:${userEmail}`);
        throw unverifiedErr;
      }

      const idToken = await result.user.getIdToken();

      let userData: User = {
        _id: result.user.uid,
        uid: result.user.uid,
        name: result.user.displayName || userEmail.split('@')[0],
        email: userEmail,
        photo: result.user.photoURL || '',
        provider: 'password',
        role: 'customer',
        status: 'active',
        loginCount: 1,
        totalSpent: 0,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      } as any;

      try {
        const syncRes = await apiService.syncUser({
          uid: result.user.uid,
          name: result.user.displayName || userEmail.split('@')[0],
          email: userEmail,
          provider: 'password',
          isAdminPortal: false,
        });
        if (syncRes.data.success) {
          userData = syncRes.data.data;
        }
      } catch (err) {}

      localStorage.setItem('manivya_customer_token', idToken);
      localStorage.setItem('manivya_customer_user', JSON.stringify(userData));
      setToken(idToken);
      setUser(userData);

      toast.success(`Welcome back, ${userData.name}!`);
    } catch (err: any) {
      if (err.message && err.message.startsWith('EMAIL_NOT_VERIFIED:')) {
        throw err;
      }
      let customMsg = 'Email or password is incorrect';
      const code = err?.code || '';
      if (code === 'auth/email-already-in-use') {
        customMsg = 'User already exists. Please sign in';
      } else if (
        code === 'auth/invalid-credential' ||
        code === 'auth/user-not-found' ||
        code === 'auth/wrong-password' ||
        code === 'auth/invalid-email'
      ) {
        customMsg = 'Email or password is incorrect';
      }
      toast.error(customMsg);
      throw new Error(customMsg);
    } finally {
      setLoading(false);
    }
  };

  // ── Dedicated Isolated Admin Login Methods ──
  const loginAdminWithEmail = async (email: string, pass: string) => {
    try {
      setLoading(true);

      let result;
      try {
        result = await signInWithEmailAndPassword(auth, email, pass);
      } catch (signInErr: any) {
        const code = signInErr?.code || '';
        if (code === 'auth/user-not-found') {
          try {
            result = await createUserWithEmailAndPassword(auth, email, pass);
          } catch (createErr: any) {
            if (createErr?.code === 'auth/email-already-in-use') {
              throw new Error('Email or password is incorrect');
            }
            throw createErr;
          }
        } else if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
          throw new Error('Email or password is incorrect');
        } else {
          throw signInErr;
        }
      }

      const userEmail = result.user.email || email;
      const idToken = await result.user.getIdToken();

      let adminData: User = {
        _id: result.user.uid,
        uid: result.user.uid,
        name: result.user.displayName || userEmail.split('@')[0] || 'MANIVYA Admin',
        email: userEmail,
        photo: result.user.photoURL || '',
        provider: 'password',
        role: 'admin',
        status: 'active',
        loginCount: 1,
        totalSpent: 0,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      } as any;

      try {
        const syncRes = await apiService.syncUser({
          uid: result.user.uid,
          name: result.user.displayName || userEmail.split('@')[0],
          email: userEmail,
          provider: 'password',
          isAdminPortal: true,
        });
        if (syncRes.data.success) {
          adminData = syncRes.data.data;
        }
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || 'Admin authentication failed';
        toast.error(msg);
        throw new Error(msg);
      }

      localStorage.setItem('manivya_admin_token', idToken);
      localStorage.setItem('manivya_admin_user', JSON.stringify(adminData));
      setAdminToken(idToken);
      setAdminUser(adminData);

      toast.success(`Admin authenticated: ${adminData.name}`);
    } catch (err: any) {
      const msg = err.message || 'Admin authentication failed';
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const loginAdminWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const email = result.user.email || '';

      let adminData: User = {
        _id: result.user.uid,
        uid: result.user.uid,
        name: result.user.displayName || 'MANIVYA Admin',
        email,
        photo: result.user.photoURL || '',
        provider: 'google.com',
        role: 'admin',
        status: 'active',
        loginCount: 1,
        totalSpent: 0,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      } as any;

      try {
        const syncRes = await apiService.syncUser({
          uid: result.user.uid,
          name: result.user.displayName || email.split('@')[0],
          email,
          photo: result.user.photoURL || '',
          provider: 'google.com',
          isAdminPortal: true,
        });
        if (syncRes.data.success) {
          adminData = syncRes.data.data;
        }
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || 'Google Admin authentication failed';
        toast.error(msg);
        throw new Error(msg);
      }

      localStorage.setItem('manivya_admin_token', idToken);
      localStorage.setItem('manivya_admin_user', JSON.stringify(adminData));
      setAdminToken(idToken);
      setAdminUser(adminData);

      toast.success(`Admin authenticated: ${adminData.name}`);
    } catch (err: any) {
      const msg = err.message || 'Google Admin authentication failed';
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (name: string, email: string, pass: string) => {
    try {
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      const userEmail = result.user.email || email;

      await sendEmailVerification(result.user);
      await signOut(auth).catch(() => {});
      localStorage.removeItem('manivya_customer_token');
      localStorage.removeItem('manivya_customer_user');
      setToken(null);
      setUser(null);

      const unverifiedErr = new Error(`EMAIL_NOT_VERIFIED:${userEmail}`);
      throw unverifiedErr;
    } catch (err: any) {
      if (err.message && err.message.startsWith('EMAIL_NOT_VERIFIED:')) {
        throw err;
      }
      let customMsg = 'Registration failed';
      const code = err?.code || '';
      if (code === 'auth/email-already-in-use') {
        customMsg = 'User already exists. Please sign in';
      } else if (
        code === 'auth/invalid-credential' ||
        code === 'auth/user-not-found' ||
        code === 'auth/wrong-password' ||
        code === 'auth/invalid-email'
      ) {
        customMsg = 'Email or password is incorrect';
      } else if (code === 'auth/weak-password') {
        customMsg = 'Password should be at least 6 characters';
      } else if (err.message) {
        customMsg = err.message;
      }
      toast.error(customMsg);
      throw new Error(customMsg);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send password reset email');
    }
  };

  const sendVerificationEmail = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        toast.success('Verification email sent!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send verification email');
    }
  };

  // Logout ONLY Customer Session
  const logout = () => {
    localStorage.removeItem('manivya_customer_token');
    localStorage.removeItem('manivya_customer_user');
    localStorage.removeItem('manivya_token');
    setToken(null);
    setUser(null);
    toast.success('Customer logged out');
  };

  // Logout ONLY Admin Portal Session
  const logoutAdmin = () => {
    localStorage.removeItem('manivya_admin_token');
    localStorage.removeItem('manivya_admin_user');
    setAdminToken(null);
    setAdminUser(null);
    toast.success('Admin Portal logged out');
  };

  const updateUserProfile = async (data: { name?: string; phone?: string; photo?: string }) => {
    try {
      const res = await apiService.updateProfile(data);
      if (res.data.success) {
        setUser(res.data.data);
        localStorage.setItem('manivya_customer_user', JSON.stringify(res.data.data));
        toast.success('Profile updated');
      }
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        adminUser,
        adminToken,
        loading,
        loginWithGoogle,
        loginWithEmail,
        loginAdminWithEmail,
        loginAdminWithGoogle,
        registerWithEmail,
        resetPassword,
        sendVerificationEmail,
        logout,
        logoutAdmin,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
