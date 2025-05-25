'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { PulsingDots } from '../components/ui/loading-spinner';
import { CheckCircle, XCircle, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const supabase = createClient();
      
      // Get token and type from URL hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const access_token = hashParams.get('access_token');
      const refresh_token = hashParams.get('refresh_token');
      const type = hashParams.get('type');

      if (type === 'email_confirmation' && access_token && refresh_token) {
        try {
          // Set the session using the tokens
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token
          });

          if (error) {
            throw error;
          }

          if (data.user?.email) {
            setEmail(data.user.email);
            setStatus('success');
            setMessage('¡Tu email ha sido verificado exitosamente!');
            
            // Redirect to dashboard after a brief delay
            setTimeout(() => {
              router.push('/dashboard');
            }, 3000);
          } else {
            throw new Error('No se pudo obtener la información del usuario');
          }
        } catch (error) {
          console.error('Error verifying email:', error);
          setStatus('error');
          setMessage(error instanceof Error ? error.message : 'Error al verificar el email');
        }
      } else {
        // Check if we're coming from a direct link without tokens
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          if (user.email_confirmed_at) {
            setStatus('success');
            setMessage('Tu email ya está verificado');
            setEmail(user.email || '');
          } else {
            setStatus('expired');
            setMessage('El enlace de verificación ha expirado o es inválido');
            setEmail(user.email || '');
          }
        } else {
          setStatus('error');
          setMessage('No se encontró información de usuario');
        }
      }
    };

    handleEmailConfirmation();
  }, [router]);

  const handleResendVerification = async () => {
    if (!email) return;
    
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        throw error;
      }

      setMessage('Se ha enviado un nuevo email de verificación');
    } catch (error) {
      console.error('Error resending verification:', error);
      setMessage(error instanceof Error ? error.message : 'Error al reenviar verificación');
    }
  };

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
              className="mx-auto mb-4"
            >
              {status === 'loading' && (
                <div className="w-16 h-16 rounded-full bg-coral/10 flex items-center justify-center">
                  <PulsingDots color="coral" size="lg" />
                </div>
              )}
              {status === 'success' && (
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              )}
              {(status === 'error' || status === 'expired') && (
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              )}
            </motion.div>

            <CardTitle className="text-2xl font-marcellus text-charcoal">
              {status === 'loading' && 'Verificando Email'}
              {status === 'success' && '¡Email Verificado!'}
              {status === 'error' && 'Error de Verificación'}
              {status === 'expired' && 'Enlace Expirado'}
            </CardTitle>

            <CardDescription className="text-charcoal/70 font-marcellus">
              {status === 'loading' && 'Por favor espera mientras verificamos tu email...'}
              {status === 'success' && `Bienvenido ${email}. Redirigiendo al dashboard...`}
              {status === 'error' && 'Hubo un problema al verificar tu email'}
              {status === 'expired' && 'El enlace de verificación ha expirado'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <p className="text-sm text-charcoal/60 font-marcellus">
                {message}
              </p>
            </motion.div>

            {status === 'expired' && email && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-4"
              >
                <Button
                  onClick={handleResendVerification}
                  className="w-full bg-coral hover:bg-coral/90 text-white font-marcellus"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Reenviar Email de Verificación
                </Button>
              </motion.div>
            )}

            {(status === 'error' || status === 'expired') && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="space-y-2"
              >
                <Button
                  onClick={() => router.push('/login')}
                  variant="outline"
                  className="w-full font-marcellus"
                >
                  Ir al Login
                </Button>
                <Button
                  onClick={() => router.push('/register')}
                  variant="link"
                  className="w-full font-marcellus text-coral hover:text-coral/80"
                >
                  Crear Nueva Cuenta
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 