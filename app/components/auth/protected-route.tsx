'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { LoadingCard } from '@/app/components/ui/loading-spinner';
import { motion } from 'framer-motion';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'patient' | 'nutritionist';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, authUser, error } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const redirectingRef = useRef(false);

  useEffect(() => {
    // Reset redirecting flag when auth state changes
    redirectingRef.current = false;
  }, [authUser, user, loading]);

  useEffect(() => {
    // Only check auth when not loading and not already redirecting
    if (!loading && !redirectingRef.current) {
      console.log('🛡️ ProtectedRoute: Checking auth...', { 
        pathname, 
        hasAuthUser: !!authUser, 
        hasUser: !!user, 
        error: !!error 
      });
      
      // If there's an auth error and we're not on login page
      if (error && pathname !== '/login') {
        console.log('🛡️ ProtectedRoute: Auth error, redirecting to login');
        redirectingRef.current = true;
        router.push('/login');
        return;
      }

      // If no auth user and we're not on login page
      if (!authUser && pathname !== '/login') {
        console.log('🛡️ ProtectedRoute: No auth user, redirecting to login');
        redirectingRef.current = true;
        router.push('/login');
        return;
      }

      // If auth user exists but no user data and we're not on login page
      if (authUser && !user && !error && pathname !== '/login') {
        console.log('🛡️ ProtectedRoute: Auth user but no user data, redirecting to login');
        redirectingRef.current = true;
        router.push('/login');
        return;
      }

      // If user has wrong role and we're not on dashboard
      if (requiredRole && user?.role !== requiredRole && pathname !== '/dashboard') {
        console.log(`🛡️ ProtectedRoute: Wrong role, redirecting to dashboard`);
        redirectingRef.current = true;
        router.push('/dashboard');
        return;
      }

      console.log('🛡️ ProtectedRoute: All checks passed');
    }
  }, [user, loading, authUser, error, requiredRole, router, pathname]);

  // Show beautiful loading state
  if (loading) {
    return <LoadingCard />;
  }

  // Show animated error state if there's an auth error
  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-warm-sand to-red-50"
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="text-red-500 mb-6"
          >
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl font-marcellus text-charcoal mb-4"
          >
            Error de Autenticación
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-charcoal/70 mb-6"
          >
            {error}
          </motion.p>
          
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/login')}
            className="bg-coral text-white px-6 py-3 rounded-lg font-marcellus hover:bg-coral/90 transition-colors shadow-lg"
          >
            Ir al Login
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  // If not authenticated, return null (redirect will happen in useEffect)
  if (!authUser || !user) {
    return null;
  }

  // If wrong role, return null (redirect will happen in useEffect)
  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  // Everything is good, render children with animation
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
} 