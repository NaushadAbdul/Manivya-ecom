import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB8V4a6xM-3XAxKNJhRls5fmRn1nUQBNVU",
  authDomain: "manivya1-b56a6.firebaseapp.com",
  projectId: "manivya1-b56a6",
  storageBucket: "manivya1-b56a6.firebasestorage.app",
  messagingSenderId: "577322827723",
  appId: "1:577322827723:web:c08c48623b8ff4eb80804e"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export default app;
