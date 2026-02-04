import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { ref, set, get, onValue } from 'firebase/database';
import { auth, googleProvider, database, ADMIN_EMAIL } from '@/lib/firebase';
import { AdminUser, AdminPermissions, DEFAULT_PERMISSIONS } from '@/types/admin';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  adminPermissions: AdminPermissions | null;
  adminAccessLevel: number;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [adminPermissions, setAdminPermissions] = useState<AdminPermissions | null>(null);
  const [adminAccessLevel, setAdminAccessLevel] = useState(0);

  // Check if user is admin from Firebase database
  const checkAdminStatus = async (userEmail: string | null) => {
    if (!userEmail) {
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setAdminPermissions(null);
      setAdminAccessLevel(0);
      return;
    }

    // Check if super admin (hardcoded)
    if (userEmail === ADMIN_EMAIL) {
      setIsAdmin(true);
      setIsSuperAdmin(true);
      setAdminPermissions({
        products: true,
        orders: true,
        users: true,
        slides: true,
        messages: true,
        coupons: true,
        reviews: true,
        projects: true,
        support: true,
        settings: true,
        adminManagement: true,
      });
      setAdminAccessLevel(100);
      return;
    }

    // Check Firebase for added admins
    try {
      const adminsRef = ref(database, 'admins');
      const snapshot = await get(adminsRef);
      
      if (snapshot.exists()) {
        const adminsData = snapshot.val();
        const admins: AdminUser[] = Object.entries(adminsData).map(([id, data]: [string, any]) => ({
          ...data,
          id,
        }));
        
        const foundAdmin = admins.find(
          (admin) => admin.email.toLowerCase() === userEmail.toLowerCase() && admin.isActive
        );
        
        if (foundAdmin) {
          setIsAdmin(true);
          setIsSuperAdmin(false);
          setAdminPermissions(foundAdmin.permissions);
          setAdminAccessLevel(foundAdmin.accessLevel);
          return;
        }
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }

    // Not an admin
    setIsAdmin(false);
    setIsSuperAdmin(false);
    setAdminPermissions(null);
    setAdminAccessLevel(0);
  };

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;
      
      setUser(user);

      if (user) {
        // Check admin status BEFORE setting loading to false
        await checkAdminStatus(user.email);
        
        // Save user to database
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (!snapshot.exists()) {
          await set(userRef, {
            email: user.email,
            displayName: user.displayName || '',
            createdAt: Date.now(),
          });
        }
      } else {
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setAdminPermissions(null);
        setAdminAccessLevel(0);
      }
      
      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, name: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await set(ref(database, `users/${result.user.uid}`), {
      email: result.user.email,
      displayName: name,
      createdAt: Date.now(),
    });
  };

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAdmin, 
      isSuperAdmin, 
      adminPermissions, 
      adminAccessLevel, 
      signIn, 
      signUp, 
      signInWithGoogle, 
      logout 
    }}>
      {!loading ? children : (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
};
