'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'patient' | 'nutritionist';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, authUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!authUser) {
        router.push('/login');
        return;
      }

      if (requiredRole && user?.role !== requiredRole) {
        router.push('/dashboard'); // Redirect to dashboard if role doesn't match
        return;
      }
    }
  }, [user, loading, authUser, requiredRole, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mist-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral mx-auto mb-4"></div>
          <p className="text-charcoal font-marcellus">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return null; // Will redirect to login
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null; // Will redirect to dashboard
  }

  return <>{children}</>;
} 