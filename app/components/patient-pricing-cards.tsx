"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import {
  Check,
  Heart,
  Gift,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { redirectToCheckout } from "@/lib/stripe/client";
import type { StripePrice } from "@/lib/stripe/shared"; // Corrected path
import { usePatientTrial } from "@/hooks/use-patient-trial";

interface PatientPricingCardsProps {
  prices: StripePrice[];
}

export function PatientPricingCards({ prices }: PatientPricingCardsProps) {
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { trialInfo, needsSubscription } = usePatientTrial();

  // Encontrar el precio del plan de pacientes
  const patientPrice = prices.find((p) => p.user_type === "patient");
  const monthlyPrice = patientPrice ? patientPrice.unit_amount / 100 : 12.99;

  const trialFeatures = [
    "Chat personalizado con IA 24/7",
    "Seguimiento nutricional completo",
    "Plan de comidas personalizado",
    "Sincronización con tu nutricionista",
    "Historial completo de conversaciones",
    "Notificaciones inteligentes",
    "Soporte técnico",
  ];

  const handleSubscribe = async () => {
    if (!patientPrice) {
      alert(
        "Error: No se pudo encontrar el plan de pacientes. Contacta soporte.",
      );
      return;
    }

    setIsSubscribing(true);

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: patientPrice.id,
          successUrl: `${window.location.origin}/dashboard?success=true&plan=patient`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: { message: "Failed to parse error from server" } }));
        console.error("Server returned an error:", response.status, errorBody);
        throw new Error(errorBody.error?.message || "Failed to create checkout session. Status: " + response.status);
      }

      const { sessionId } = await response.json();
      await redirectToCheckout(sessionId);
    } catch (error) {
      console.error("Error creating subscription:", error);
      alert(
        "Hubo un error al procesar tu suscripción. Por favor, intenta de nuevo.",
      );
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Trial Status Info */}
      {trialInfo && (
        <div className="text-center mb-12">
          {trialInfo.isActive ? (
            <div className="bg-sage-green/10 border border-sage-green/30 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-sage-green mr-3" />

                <h2 className="text-2xl font-bold text-charcoal">
                  ¡Tu trial está activo!
                </h2>
              </div>
              <p className="text-lg text-charcoal/70 mb-4">
                Te quedan{" "}
                <span className="font-bold text-sage-green">
                  {trialInfo.daysRemaining} días
                </span>{" "}
                de acceso completo gratuito
              </p>
              <div className="bg-sage-green/5 rounded-lg p-4">
                <p className="text-sm text-charcoal/60">
                  Suscríbete ahora para asegurar tu acceso continuo a todas las
                  funciones premium
                </p>
              </div>
            </div>
          ) : needsSubscription ? (
            <div className="bg-coral/10 border border-coral/30 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-center mb-4">
                <Gift className="h-8 w-8 text-coral mr-3" />
                <h2 className="text-2xl font-bold text-charcoal">
                  Tu trial ha terminado
                </h2>
              </div>
              <p className="text-lg text-charcoal/70 mb-4">
                Suscríbete para continuar tu transformación nutricional
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* Main Pricing Card */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Trial Card */}
        <Card className="relative p-8 bg-gradient-to-br from-sage-green/10 to-coral/10 border-sage-green/30 hover:border-sage-green/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-sage-green text-white px-4 py-1">
            <Gift className="h-3 w-3 mr-1" />
            15 Días Gratis
          </Badge>

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-sage-green/10 mb-4">
              <Gift className="h-10 w-10 text-sage-green" />
            </div>

            <h3 className="text-3xl font-bold text-charcoal mb-2">
              Trial Gratuito
            </h3>

            <p className="text-charcoal/70 mb-4">
              Prueba todas las funciones sin costo
            </p>

            <div className="mb-6">
              <div className="text-5xl font-bold text-charcoal">Gratis</div>
              <div className="text-charcoal/60">por 15 días</div>
            </div>
          </div>

          <ul className="space-y-3 mb-8">
            {trialFeatures.slice(0, 5).map((feature, index) => (
              <li key={index} className="flex items-center text-charcoal/80">
                <Check className="h-5 w-5 mr-3 text-sage-green flex-shrink-0" />

                <span className="text-sm">{feature}</span>
              </li>
            ))}
            <li className="flex items-center text-charcoal/60">
              <Sparkles className="h-5 w-5 mr-3 text-sage-green flex-shrink-0" />

              <span className="text-sm italic">Y mucho más...</span>
            </li>
          </ul>

          <div className="bg-sage-green/5 rounded-lg p-4 mb-6">
            <p className="text-xs text-charcoal/60 text-center">
              ✨ Acceso inmediato a todas las funciones premium durante tu trial
            </p>
          </div>
        </Card>

        {/* Subscription Card */}
        <Card className="relative p-8 bg-gradient-to-br from-soft-rose/10 to-coral/10 border-coral/40 hover:border-coral/60 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 shadow-xl scale-105">
          <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-soft-rose to-coral text-white px-4 py-1">
            <Heart className="h-3 w-3 mr-1" />
            Recomendado
          </Badge>

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-coral/10 mb-4">
              <Heart className="h-10 w-10 text-coral" />
            </div>

            <h3 className="text-3xl font-bold text-charcoal mb-2">
              Plan Mensual
            </h3>

            <p className="text-charcoal/70 mb-4">
              Continúa tu transformación nutricional
            </p>

            <div className="mb-6">
              <div className="text-5xl font-bold text-charcoal">
                ${monthlyPrice}
              </div>
              <div className="text-charcoal/60">por mes</div>
              <div className="text-sm text-coral font-medium mt-1">
                Después del trial gratuito
              </div>
            </div>
          </div>

          <ul className="space-y-3 mb-8">
            {trialFeatures.map((feature, index) => (
              <li key={index} className="flex items-center text-charcoal/80">
                <Check className="h-5 w-5 mr-3 text-coral flex-shrink-0" />

                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            onClick={handleSubscribe}
            disabled={isSubscribing}
            className="w-full transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 bg-gradient-to-r from-soft-rose to-coral hover:from-soft-rose/90 hover:to-coral/90 text-white shadow-lg"
            size="lg"
          >
            {isSubscribing ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Procesando...
              </div>
            ) : (
              <div className="flex items-center">
                {needsSubscription
                  ? "Suscribirse Ahora"
                  : "Comenzar Trial Gratuito"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            )}
          </Button>

          <div className="bg-coral/5 rounded-lg p-4 mt-6">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="h-4 w-4 text-coral mr-2" />

              <span className="text-sm font-medium text-coral">
                Garantía de satisfacción
              </span>
            </div>
            <p className="text-xs text-charcoal/60 text-center">
              Cancela cuando quieras. No hay compromisos a largo plazo.
            </p>
          </div>
        </Card>
      </div>

      {/* Value Proposition */}
      <div className="text-center mt-12 p-8 bg-warm-sand/50 rounded-2xl">
        <h4 className="text-2xl font-bold text-charcoal mb-4">
          ¿Por qué elegir NutriGuide?
        </h4>
        <div className="grid md:grid-cols-3 gap-6 text-sm text-charcoal/70">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-sage-green/10 rounded-full flex items-center justify-center mb-3">
              <Sparkles className="h-6 w-6 text-sage-green" />
            </div>
            <div className="font-medium mb-1 text-charcoal">
              IA Personalizada
            </div>
            <div className="text-center">
              Respuestas adaptadas a tu perfil y objetivos únicos
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-coral/10 rounded-full flex items-center justify-center mb-3">
              <Heart className="h-6 w-6 text-coral" />
            </div>
            <div className="font-medium mb-1 text-charcoal">Conexión Real</div>
            <div className="text-center">
              Sincronizado con tu nutricionista para coherencia total
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-soft-rose/20 rounded-full flex items-center justify-center mb-3">
              <Clock className="h-6 w-6 text-soft-rose" />
            </div>
            <div className="font-medium mb-1 text-charcoal">
              Disponible 24/7
            </div>
            <div className="text-center">
              Orientación nutricional cuando la necesites
            </div>
          </div>
        </div>
      </div>

      {/* Trial CTA Bottom */}
      {!trialInfo?.hasSubscription && !needsSubscription && (
        <div className="text-center mt-8">
          <p className="text-charcoal/70 mb-4">
            🎁 <strong>¡Oferta especial!</strong> Prueba gratis por 15 días
          </p>
          <p className="text-sm text-charcoal/50">
            No se requiere tarjeta de crédito para el trial
          </p>
        </div>
      )}
    </div>
  );
} 