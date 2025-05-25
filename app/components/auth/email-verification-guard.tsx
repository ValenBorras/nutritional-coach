'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Mail, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmailVerificationGuardProps {
  children: React.ReactNode;
}

export function EmailVerificationGuard({ children }: EmailVerificationGuardProps) {
  const { authUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && authUser && !authUser.email_confirmed_at) {
      // Redirect unverified users
      router.push(`/check-email?email=${encodeURIComponent(authUser.email || '')}`);
    }
  }, [authUser, loading, router]);

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral"></div>
      </div>
    );
  }

  // Show verification required message for unverified users
  if (authUser && !authUser.email_confirmed_at) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-warm-sand via-warm-sand/90 to-sage/20 py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto mb-4 w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center"
              >
                <Shield className="w-8 h-8 text-amber-600" />
              </motion.div>

              <CardTitle className="text-2xl font-marcellus text-charcoal">
                Verificación Requerida
              </CardTitle>

              <CardDescription className="text-charcoal/70 font-marcellus">
                Tu cuenta necesita verificación de email antes de continuar
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 text-center">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-700 font-marcellus">
                  Por tu seguridad, necesitas verificar tu dirección de email antes de acceder a tu cuenta.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => router.push(`/check-email?email=${encodeURIComponent(authUser.email || '')}`)}
                  className="w-full bg-coral hover:bg-coral/90 text-white font-marcellus"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Verificar Email
                </Button>

                <Button
                  onClick={() => router.push('/login')}
                  variant="outline"
                  className="w-full font-marcellus"
                >
                  Volver al Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // User is verified, render children
  return <>{children}</>;
} 