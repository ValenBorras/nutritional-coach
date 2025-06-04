"use client";

import { usePatientTrial } from "@/hooks/use-patient-trial";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Clock, Star, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { redirectToCheckout } from "@/lib/stripe/client";
import { useRouter } from "next/navigation";

export function TrialBanner() {
  const { trialInfo, isLoading, trialEndingSoon, needsSubscription } =
    usePatientTrial();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const router = useRouter();

  // No mostrar si está cargando o no hay info de trial
  if (isLoading || !trialInfo) return null;

  // No mostrar si ya tiene suscripción activa
  if (trialInfo.hasSubscription) return null;

  // Si necesita suscripción (trial expirado)
  if (needsSubscription) {
    return (
      <Card className="border-red-200 bg-red-50 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />

            <div>
              <h3 className="font-semibold text-red-800">
                Tu trial ha expirado
              </h3>
              <p className="text-sm text-red-700">
                Suscríbete para continuar accediendo a todas las funciones
              </p>
            </div>
          </div>
          <Button
            onClick={handleSubscribe}
            disabled={isSubscribing}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSubscribing ? "Procesando..." : "Suscribirse ($12.99/mes)"}
          </Button>
        </div>
      </Card>
    );
  }

  // Si el trial está activo
  if (trialInfo.isActive) {
    const bgColor = trialEndingSoon
      ? "bg-gradient-to-r from-orange-500 to-red-600"
      : "bg-gradient-to-r from-blue-500 to-purple-600";

    const textColor = "text-white";
    const icon = trialEndingSoon ? AlertTriangle : Clock;

    return (
      <Card className={`${bgColor} ${textColor} p-4 mb-6 border-0`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon === AlertTriangle ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <Clock className="h-5 w-5" />
            )}
            <div>
              <h3 className="font-semibold">
                {trialEndingSoon
                  ? "¡Tu trial termina pronto!"
                  : "¡Trial gratuito activo!"}
              </h3>
              <p className="text-sm opacity-90">
                Te quedan {trialInfo.daysRemaining} día
                {trialInfo.daysRemaining !== 1 ? "s" : ""} gratis
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSubscribe}
            disabled={isSubscribing}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
          >
            <Star className="h-4 w-4 mr-2" />
            {isSubscribing ? "Procesando..." : "Suscribirse ahora"}
          </Button>
        </div>
      </Card>
    );
  }

  // No mostrar nada si no está en ninguna condición especial
  return null;

  async function handleSubscribe() {
    setIsSubscribing(true);

    try {
      // Crear sesión de checkout para el plan de pacientes
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: "price_1RVDer4E1fMQUCHe1bi3YujU", // Price ID real de Stripe para pacientes
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/dashboard?canceled=true`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
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
  }
}
