"use client";

import { useState } from 'react';
import { CheckoutModal } from '@/app/components/checkout-modal';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

export default function TestCheckoutPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  // Test plans
  const testPlans = [
    {
      priceId: "price_test_patient_monthly",
      planName: "Plan Paciente Mensual",
      amount: 1299, // $12.99
      currency: "usd",
      interval: "month",
      trialDays: 15,
      type: "patient",
    },
    {
      priceId: "price_test_nutritionist_pro",
      planName: "Plan Nutricionista Pro",
      amount: 2999, // $29.99
      currency: "usd",
      interval: "month",
      trialDays: 0,
      type: "nutritionist",
    },
    {
      priceId: "price_test_nutritionist_free",
      planName: "Plan Nutricionista Gratuito",
      amount: 0, // Free
      currency: "usd",
      interval: "month",
      trialDays: 0,
      type: "nutritionist",
    }
  ];

  const handlePlanSelect = (plan: any) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    alert(`¡Éxito! Suscripción a ${selectedPlan?.planName} completada.`);
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  return (
    <div className="min-h-screen bg-mist-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-marcellus text-charcoal mb-2">
            🧪 Test: Checkout Embebido
          </h1>
          <p className="text-charcoal/70">
            Página de prueba para testear el checkout embebido con datos reales
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {testPlans.map((plan) => (
            <Card key={plan.priceId} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg text-charcoal">
                  {plan.planName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-charcoal">
                    {plan.amount > 0 ? formatPrice(plan.amount) : 'Gratis'}
                  </div>
                  <div className="text-sm text-charcoal/60">
                    por {plan.interval === 'month' ? 'mes' : 'año'}
                  </div>
                </div>

                {plan.trialDays > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <div className="text-sm text-blue-600">
                      🎁 {plan.trialDays} días gratis
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-sm text-charcoal/70">
                  {plan.type === 'patient' ? (
                    <>
                      <div>✅ Chat IA personalizado</div>
                      <div>✅ Seguimiento nutricional</div>
                      <div>✅ Planes de comida</div>
                    </>
                  ) : (
                    <>
                      <div>✅ Panel de control</div>
                      <div>✅ {plan.amount === 0 ? 'Hasta 5 pacientes' : 'Pacientes ilimitados'}</div>
                      <div>✅ IA configurada</div>
                    </>
                  )}
                </div>

                <Button
                  onClick={() => handlePlanSelect(plan)}
                  className="w-full bg-coral hover:bg-coral/90"
                  disabled={plan.amount === 0}
                >
                  {plan.amount === 0 ? 'Plan Actual' : 'Probar Checkout'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-800">
              📋 Instrucciones de Prueba
            </CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-800 text-sm space-y-2">
            <div>
              <strong>1. Datos de prueba:</strong> Ejecuta el script SQL en Supabase para insertar precios de prueba
            </div>
            <div>
              <strong>2. Trial (Pacientes):</strong> Los planes con trial no requieren tarjeta
            </div>
            <div>
              <strong>3. Planes de pago:</strong> Usa tarjeta de prueba 4242 4242 4242 4242
            </div>
            <div>
              <strong>4. Variables de entorno:</strong> Asegúrate de tener configuradas las claves de Stripe
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Checkout */}
      {selectedPlan && (
        <CheckoutModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          priceId={selectedPlan.priceId}
          planName={selectedPlan.planName}
          amount={selectedPlan.amount}
          currency={selectedPlan.currency}
          interval={selectedPlan.interval}
          trialDays={selectedPlan.trialDays}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
} 