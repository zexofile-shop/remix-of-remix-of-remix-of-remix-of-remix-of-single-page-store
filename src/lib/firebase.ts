import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyD4tLEbCLNddJNAp1XC5FmA-sEiDIFdcxw",
  authDomain: "edushop-6b6ed.firebaseapp.com",
  databaseURL: "https://edushop-6b6ed-default-rtdb.firebaseio.com",
  projectId: "edushop-6b6ed",
  storageBucket: "edushop-6b6ed.firebasestorage.app",
  messagingSenderId: "302696717280",
  appId: "1:302696717280:web:da698872e510ba66972985",
  measurementId: "G-86H86MZQ1V"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const database = getDatabase(app);

export const ADMIN_EMAIL = "techshivam0616@gmail.com";
