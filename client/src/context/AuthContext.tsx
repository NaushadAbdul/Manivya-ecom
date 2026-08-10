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
  // Storefront Customer Auth Session
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

  // Dedicated Isolated Admin Portal Auth Session
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

  // Persistent Firebase Auth Observer (Synchronizes customer storefront session)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const isPasswordUser = firebaseUser.providerData.some((p) => p.providerId === 'password');
        if (isPasswordUser && !firebaseUser.emailVerified) {
          await signOut(auth).catch(() => {});
          localStorage.removeItem('manivya_customer_token');
          localStorage.removeItem('manivya_customer_user');
          setToken(null);
          setUser(null);
          setLoading(false);
          return;
        }

        try {
          const idToken = await firebaseUser.getIdToken();
          const email = firebaseUser.email || '';
          const isAdmin = email.includes('admin') || email.toLowerCase().trim() === 'naushadabdul2006@gmail.com';

          let userData: User = {
            _id: firebaseUser.uid,
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || email.split('@')[0] || 'Valued Customer',
            email,
            photo: firebaseUser.photoURL || '',
            provider: firebaseUser.providerData[0]?.providerId || 'password',
            role: isAdmin ? 'admin' : 'customer',
            status: 'active',
            loginCount: 1,
            totalSpent: 0,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          } as any;

          try {
            const syncRes = await apiService.syncUser({
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || email.split('@')[0] || 'Valued Customer',
              email,
              photo: firebaseUser.photoURL || '',
              provider: firebaseUser.providerData[0]?.providerId || 'password',
            });
            if (syncRes.data.success) {
              userData = syncRes.data.data;
            }
          } catch (syncErr) {}

          // If logging into admin account on storefront or customer account, set customer session safely
          localStorage.setItem('manivya_customer_token', idToken);
          localStorage.setItem('manivya_customer_user', JSON.stringify(userData));
          setToken(idToken);
          setUser(userData);
        } catch (err: any) {
          console.warn('Backend token verification error', err);
        }
      } else {
        // Firebase signed out on customer side
        localStorage.removeItem('manivya_customer_token');
        localStorage.removeItem('manivya_customer_user');
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ── Customer Login Methods ──
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const email = result.user.email || '';
      const isAdmin = email.includes('admin') || email.toLowerCase().trim() === 'naushadabdul2006@gmail.com';

      let userData: User = {
        _id: result.user.uid,
        uid: result.user.uid,
        name: result.user.displayName || email.split('@')[0],
        email,
        photo: result.user.photoURL || '',
        provider: 'google.com',
        role: isAdmin ? 'admin' : 'customer',
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
      const isAdmin = userEmail.includes('admin') || userEmail.toLowerCase().trim() === 'naushadabdul2006@gmail.com';

      let userData: User = {
        _id: result.user.uid,
        uid: result.user.uid,
        name: result.user.displayName || userEmail.split('@')[0],
        email: userEmail,
        photo: result.user.photoURL || '',
        provider: 'password',
        role: isAdmin ? 'admin' : 'customer',
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
      const result = await signInWithEmailAndPassword(auth, email, pass);
      const userEmail = result.user.email || email;

      const idToken = await result.user.getIdToken();

      let adminData: User = {
        _id: result.user.uid,
        uid: result.user.uid,
        name: result.user.displayName || 'MANIVYA Admin',
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
        });
        if (syncRes.data.success) {
          adminData = syncRes.data.data;
        }
      } catch (err) {}

      // Save into isolated Admin localStorage session
      localStorage.setItem('manivya_admin_token', idToken);
      localStorage.setItem('manivya_admin_user', JSON.stringify(adminData));
      setAdminToken(idToken);
      setAdminUser(adminData);

      toast.success(`Admin authenticated: ${adminData.name}`);
    } catch (err: any) {
      const msg = err.message || 'Admin authentication failed';
      toast.error(msg);
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
        });
        if (syncRes.data.success) {
          adminData = syncRes.data.data;
        }
      } catch (err) {}

      localStorage.setItem('manivya_admin_token', idToken);
      localStorage.setItem('manivya_admin_user', JSON.stringify(adminData));
      setAdminToken(idToken);
      setAdminUser(adminData);

      toast.success(`Admin authenticated: ${adminData.name}`);
    } catch (err: any) {
      toast.error(err.message || 'Google Admin authentication failed');
      throw err;
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
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {}
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
