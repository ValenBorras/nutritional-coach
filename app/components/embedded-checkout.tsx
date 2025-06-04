"use client";

import { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Loader2, CreditCard, CheckCircle, AlertCircle, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface EmbeddedCheckoutProps {
  priceId: string;
  planName: string;
  amount: number;
  currency: string;
  interval: string;
  trialDays?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Componente interno que usa los hooks de Stripe
function CheckoutForm({ 
  priceId, 
  planName, 
  amount, 
  currency, 
  interval, 
  trialDays,
  onSuccess,
  onCancel 
}: EmbeddedCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isTrialSubscription, setIsTrialSubscription] = useState(false);

  useEffect(() => {
    createPaymentIntent();
  }, [priceId]);

  const createPaymentIntent = async () => {
    try {
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el pago');
      }

      // Si es una suscripción con trial, no necesitamos payment intent
      if (data.trialSubscription) {
        setIsTrialSubscription(true);
        setSuccess(true);
        return;
      }

      setClientSecret(data.clientSecret);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Si es trial, ya está procesado
    if (isTrialSubscription) {
      onSuccess?.();
      return;
    }

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Error al cargar el formulario de pago');
      setIsLoading(false);
      return;
    }

    // Confirmar el pago
    const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (stripeError) {
      setError(stripeError.message || 'Error en el pago');
      setIsLoading(false);
    } else {
      setSuccess(true);
      setIsLoading(false);
      onSuccess?.();
    }
  };

  const handleTrialStart = () => {
    setIsLoading(true);
    // Simular procesamiento
    setTimeout(() => {
      setSuccess(true);
      setIsLoading(false);
      onSuccess?.();
    }, 1000);
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        {isTrialSubscription ? (
          <Gift className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        ) : (
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        )}
        <h3 className="text-xl font-semibold text-charcoal mb-2">
          {isTrialSubscription ? '¡Trial Iniciado!' : '¡Suscripción Exitosa!'}
        </h3>
        <p className="text-charcoal/70 mb-4">
          {isTrialSubscription 
            ? `Tu período de prueba de ${trialDays} días ha comenzado. ¡Disfruta de todas las funciones!`
            : 'Tu suscripción está activa.'
          }
        </p>
        <Button onClick={onSuccess} className="bg-coral hover:bg-coral/90">
          Continuar
        </Button>
      </motion.div>
    );
  }

  // Si es trial y está listo, mostrar botón especial
  if (isTrialSubscription && !success) {
    return (
      <div className="space-y-6">
        {/* Plan Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-charcoal">{planName}</h4>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">
                ¡Gratis por {trialDays} días!
              </div>
              <div className="text-sm text-charcoal/60">
                Luego {formatPrice(amount, currency)}/{interval === 'month' ? 'mes' : 'año'}
              </div>
            </div>
          </div>
          <div className="text-sm text-blue-600 flex items-center gap-1">
            🎁 Sin tarjeta requerida durante el trial
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleTrialStart}
            disabled={isLoading}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Iniciando...
              </>
            ) : (
              <>
                <Gift className="w-4 h-4 mr-2" />
                Comenzar Trial Gratuito
              </>
            )}
          </Button>
        </div>

        {/* Security Notice */}
        <div className="text-xs text-charcoal/60 text-center">
          🔒 Sin compromiso - Cancela en cualquier momento durante el trial
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Plan Summary */}
      <div className="bg-gradient-to-r from-coral/10 to-soft-rose/10 p-4 rounded-lg border border-coral/20">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-charcoal">{planName}</h4>
          <div className="text-right">
            <div className="text-lg font-bold text-charcoal">
              {formatPrice(amount, currency)}
            </div>
            <div className="text-sm text-charcoal/60">
              por {interval === 'month' ? 'mes' : 'año'}
            </div>
          </div>
        </div>
        {trialDays && (
          <div className="text-sm text-blue-600 flex items-center gap-1">
            🎁 {trialDays} días de prueba gratuita incluidos
          </div>
        )}
      </div>

      {/* Card Input */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-charcoal">
          Información de la Tarjeta
        </label>
        <div className="p-4 border border-gray-200 rounded-lg focus-within:border-coral focus-within:ring-1 focus-within:ring-coral">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#374151',
                  fontFamily: 'system-ui, sans-serif',
                  '::placeholder': {
                    color: '#9CA3AF',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isLoading || !clientSecret}
          className="flex-1 bg-coral hover:bg-coral/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              {trialDays ? 'Comenzar Prueba Gratuita' : 'Suscribirse Ahora'}
            </>
          )}
        </Button>
      </div>

      {/* Security Notice */}
      <div className="text-xs text-charcoal/60 text-center">
        🔒 Tus datos están protegidos con encriptación SSL de 256 bits
      </div>
    </form>
  );
}

// Componente principal que envuelve con Elements Provider
export function EmbeddedCheckout(props: EmbeddedCheckoutProps) {
  const elementsOptions: StripeElementsOptions = {
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#E87B7B', // coral color
        colorBackground: '#ffffff',
        colorText: '#374151',
        colorDanger: '#dc2626',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Card className="max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <CreditCard className="w-5 h-5 text-coral" />
          Finalizar Suscripción
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripePromise} options={elementsOptions}>
          <CheckoutForm {...props} />
        </Elements>
      </CardContent>
    </Card>
  );
} 