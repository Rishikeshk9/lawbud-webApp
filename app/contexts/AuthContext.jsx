'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Protected routes that require authentication
  const protectedRoutes = [
    '/profile',
    '/chats',
    '/lawyers/[id]/chat',
    '/lawyers',
  ];

  // Auth pages that should redirect to home if user is authenticated
  const authPages = ['/login', '/register'];

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle route protection
  useEffect(() => {
    if (loading) return;

    // Check if current path matches any protected route patterns
    const isProtectedRoute = protectedRoutes.some((route) => {
      // Convert route pattern to regex
      const pattern = route.replace(/\[.*?\]/g, '[^/]+');
      const regex = new RegExp(`^${pattern}`);
      return regex.test(pathname);
    });

    const isAuthPage = authPages.some((page) => pathname.startsWith(page));

    if (!session && isProtectedRoute) {
      router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`);
    } else if (session && isAuthPage) {
      router.push('/');
    }
  }, [session, loading, pathname, router]);

  const value = {
    session,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
