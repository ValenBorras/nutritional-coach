'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '../ui/button';
import { PulsingDots } from '../ui/loading-spinner';

interface GoogleLoginButtonProps {
  disabled?: boolean;
  className?: string;
}

export function GoogleLoginButton({ disabled = false, className = '' }: GoogleLoginButtonProps) {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: googleError } = await signInWithGoogle();
      
      if (googleError) {
        throw new Error(googleError.message);
      }
      
      // The redirect will happen automatically, so we don't need to do anything else
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión con Google');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleLogin}
        disabled={disabled || isLoading}
        className={`w-full font-medium text-base h-12 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm ${className}`}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <PulsingDots color="charcoal" size="sm" />
            <span className="text-gray-600">Conectando...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-gray-700">Continuar con Google</span>
          </div>
        )}
      </Button>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="text-sm text-red-600 font-marcellus">
            {error}
          </div>
        </div>
      )}
    </div>
  );
} 