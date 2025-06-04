"use client";

import { useState } from 'react';
import { EmbeddedCheckout } from '@/app/components/embedded-checkout';
import { CheckoutModal } from '@/app/components/checkout-modal';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

export default function EmbeddedCheckoutDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showInlineCheckout, setShowInlineCheckout] = useState(false);

  // Mock plan data for testing
  const mockPlan = {
    priceId: "price_1234567890", // This would be a real Stripe price ID
    planName: "Plan Paciente",
    amount: 1299, // $12.99 in cents
    currency: "usd",
    interval: "month",
    trialDays: 15,
  };

  const handleSuccess = () => {
    alert("¡Suscripción exitosa! En producción esto actualizará la base de datos.");
    setIsModalOpen(false);
    setShowInlineCheckout(false);
  };

  return (
    <div className="min-h-screen bg-mist-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-marcellus text-charcoal mb-2">
            🧪 Demo: Checkout Embebido
          </h1>
          <p className="text-charcoal/70">
            Prueba el sistema de checkout integrado en la aplicación
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Modal Checkout Demo */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-charcoal">
                Checkout en Modal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-charcoal/70 text-sm">
                El checkout se abre en un modal superpuesto, manteniendo el contexto de la aplicación.
              </p>
              
              <div className="bg-coral/10 p-4 rounded-lg">
                <h4 className="font-medium text-charcoal mb-2">Plan a Suscribir:</h4>
                <div className="text-sm text-charcoal/70 space-y-1">
                  <div>💳 {mockPlan.planName}</div>
                  <div>💰 ${(mockPlan.amount / 100).toFixed(2)} USD/mes</div>
                  <div>🎁 {mockPlan.trialDays} días de prueba gratis</div>
                </div>
              </div>

              <Button 
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-coral hover:bg-coral/90"
              >
                Abrir Checkout Modal
              </Button>

              <div className="text-xs text-charcoal/60">
                ✨ <strong>Ventajas del Modal:</strong><br />
                • No abandona la página<br />
                • Mejor UX para cambios de plan<br />
                • Fácil cancelación
              </div>
            </CardContent>
          </Card>

          {/* Inline Checkout Demo */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-charcoal">
                Checkout Inline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-charcoal/70 text-sm">
                El checkout se muestra directamente en la página, ideal para flows dedicados.
              </p>

              <Button 
                onClick={() => setShowInlineCheckout(!showInlineCheckout)}
                variant="outline"
                className="w-full border-coral text-coral hover:bg-coral hover:text-white"
              >
                {showInlineCheckout ? 'Ocultar' : 'Mostrar'} Checkout Inline
              </Button>

              <div className="text-xs text-charcoal/60">
                ✨ <strong>Ventajas del Inline:</strong><br />
                • Parte natural del flujo<br />
                • Mejor para páginas de pricing<br />
                • UX más directa
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inline Checkout */}
        {showInlineCheckout && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-charcoal mb-4 text-center">
              Checkout Inline Demo
            </h3>
            <EmbeddedCheckout
              priceId={mockPlan.priceId}
              planName={mockPlan.planName}
              amount={mockPlan.amount}
              currency={mockPlan.currency}
              interval={mockPlan.interval}
              trialDays={mockPlan.trialDays}
              onSuccess={handleSuccess}
              onCancel={() => setShowInlineCheckout(false)}
            />
          </div>
        )}

        {/* Important Notes */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900 text-lg">
              📝 Notas Importantes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800 text-sm space-y-2">
            <div>
              🔧 <strong>Para Testing Real:</strong> Necesitas agregar price IDs reales de Stripe
            </div>
            <div>
              💳 <strong>Tarjetas de Prueba:</strong> 4242 4242 4242 4242 (Stripe test mode)
            </div>
            <div>
              ⚠️ <strong>Este Demo:</strong> Mostrará un error porque no hay price IDs reales configurados
            </div>
            <div>
              🚀 <strong>Producción:</strong> Una vez configurado Stripe, funcionará completamente
            </div>
          </CardContent>
        </Card>

        {/* Technical Implementation */}
        <Card className="bg-sage-green/10 border-sage-green/30">
          <CardHeader>
            <CardTitle className="text-sage-green text-lg">
              🛠️ Implementación Técnica
            </CardTitle>
          </CardHeader>
          <CardContent className="text-charcoal text-sm space-y-3">
            <div>
              <strong>Flujo de Pago:</strong>
              <ol className="list-decimal list-inside mt-1 ml-4 space-y-1">
                <li>Usuario selecciona plan</li>
                <li>Se crea PaymentIntent en el servidor</li>
                <li>Se muestra el formulario de Stripe Elements</li>
                <li>Usuario ingresa datos de tarjeta</li>
                <li>Se confirma el pago con Stripe</li>
                <li>Webhook actualiza la base de datos</li>
                <li>Usuario ve confirmación de éxito</li>
              </ol>
            </div>
            
            <div>
              <strong>Componentes Usados:</strong>
              <ul className="list-disc list-inside mt-1 ml-4 space-y-1">
                <li><code>EmbeddedCheckout</code> - Formulario principal</li>
                <li><code>CheckoutModal</code> - Wrapper modal</li>
                <li><code>@stripe/stripe-js</code> - SDK de Stripe</li>
                <li><code>@stripe/react-stripe-js</code> - Componentes React</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      <CheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        priceId={mockPlan.priceId}
        planName={mockPlan.planName}
        amount={mockPlan.amount}
        currency={mockPlan.currency}
        interval={mockPlan.interval}
        trialDays={mockPlan.trialDays}
        onSuccess={handleSuccess}
      />
    </div>
  );
} 