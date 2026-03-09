import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AdminPermissions {
  products?: boolean;
  orders?: boolean;
  users?: boolean;
  slides?: boolean;
  messages?: boolean;
  coupons?: boolean;
  reviews?: boolean;
  projects?: boolean;
  support?: boolean;
  settings?: boolean;
  adminManagement?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  adminPermissions: AdminPermissions | null;
  adminAccessLevel: number;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const SUPER_ADMIN_EMAILS = [
  "techshivam0616@gmail.com",
  "niteshprakash555@gmail.com"
];

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
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [adminPermissions, setAdminPermissions] = useState<AdminPermissions | null>(null);
  const [adminAccessLevel, setAdminAccessLevel] = useState(0);

  const checkAdminStatus = async (currentUser: User | null) => {
    if (!currentUser?.email) {
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setAdminPermissions(null);
      setAdminAccessLevel(0);
      return;
    }

    // Check super admin
    if (SUPER_ADMIN_EMAILS.includes(currentUser.email.toLowerCase())) {
      setIsAdmin(true);
      setIsSuperAdmin(true);
      setAdminPermissions({
        products: true, orders: true, users: true, slides: true,
        messages: true, coupons: true, reviews: true, projects: true,
        support: true, settings: true, adminManagement: true,
      });
      setAdminAccessLevel(100);
      return;
    }

    // Check user_roles table
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('role', 'admin')
        .eq('is_active', true)
        .maybeSingle();

      if (data) {
        setIsAdmin(true);
        setIsSuperAdmin(false);
        setAdminPermissions(data.permissions as AdminPermissions || {});
        setAdminAccessLevel(data.access_level || 0);
        return;
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }

    setIsAdmin(false);
    setIsSuperAdmin(false);
    setAdminPermissions(null);
    setAdminAccessLevel(0);
  };

  useEffect(() => {
    // Set up auth listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        // Use setTimeout to avoid deadlock with Supabase auth
        setTimeout(() => checkAdminStatus(currentSession.user), 0);
      } else {
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setAdminPermissions(null);
        setAdminAccessLevel(0);
      }
      setLoading(false);
    });

    // THEN check initial session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        checkAdminStatus(currentSession.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user, session, loading, isAdmin, isSuperAdmin,
      adminPermissions, adminAccessLevel,
      signIn, signUp, logout
    }}>
      {!loading ? children : (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
};
