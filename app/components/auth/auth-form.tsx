'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { signInWithEmail } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    try {
      if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name, role: 'patient' }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Error al registrar usuario');
        }

        // Después del registro exitoso, iniciar sesión automáticamente
        const { error: signInError } = await signInWithEmail(email, password);

        if (signInError) {
          throw new Error(signInError.message);
        }
      } else {
        const { error: signInError } = await signInWithEmail(email, password);

        if (signInError) {
          throw new Error(signInError.message);
        }
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl font-marcellus tracking-wide text-center">
          {mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
        </CardTitle>
        <CardDescription className="text-center font-marcellus">
          {mode === 'login'
            ? 'Ingresa tus credenciales para acceder a tu cuenta'
            : 'Crea una cuenta para comenzar tu viaje de nutrición'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="name" className="font-marcellus">Nombre</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Tu nombre"
                disabled={isLoading}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="font-marcellus">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="tu@email.com"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="font-marcellus">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>
          {error && (
            <div className="text-sm text-red-500 mt-2 font-marcellus">{error}</div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full font-marcellus text-lg"
            disabled={isLoading}
          >
            {isLoading
              ? 'Cargando...'
              : mode === 'login'
              ? 'Iniciar Sesión'
              : 'Registrarse'}
          </Button>
          <div className="text-sm text-center font-marcellus">
            {mode === 'login' ? (
              <p>
                ¿No tienes una cuenta?{' '}
                <Button
                  variant="link"
                  className="p-0 font-marcellus"
                  onClick={() => router.push('/register')}
                >
                  Regístrate aquí
                </Button>
              </p>
            ) : (
              <p>
                ¿Ya tienes una cuenta?{' '}
                <Button
                  variant="link"
                  className="p-0 font-marcellus"
                  onClick={() => router.push('/login')}
                >
                  Inicia sesión aquí
                </Button>
              </p>
            )}
          </div>
        </CardFooter>
      </form>
    </Card>
  );
} 