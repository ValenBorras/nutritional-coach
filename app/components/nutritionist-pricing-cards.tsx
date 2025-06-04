"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Check, Star, Crown, Zap, ArrowRight } from "lucide-react";
import { formatPrice, redirectToCheckout } from "@/lib/stripe/client";
import { STRIPE_CONFIG } from "@/lib/stripe/shared";
import type { StripePrice } from "@/lib/stripe/shared";

interface NutritionistPricingCardsProps {
  prices: StripePrice[];
}

export function NutritionistPricingCards({
  prices,
}: NutritionistPricingCardsProps) {
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

  // Organizar precios por tipo
  const freePlan = STRIPE_CONFIG.nutritionist.free;
  const professionalPrice = prices.find((p) =>
    p.nickname?.includes("Profesional"),
  );
  const clinicPrice = prices.find((p) => p.nickname?.includes("Clínica"));

  const plans = [
    {
      id: "free",
      name: freePlan.name,
      price: freePlan.price,
      priceId: null,
      popular: false,
      description: "Perfecto para empezar",
      features: freePlan.features,
      maxPatients: freePlan.maxPatients,
      icon: <Zap className="h-6 w-6" />,
      cardStyle: "bg-warm-sand border-coral hover:border-coral shadow-lg",
      buttonStyle: "bg-coral hover:bg-coral/90 text-white",
      badgeStyle: "bg-coral text-white",
      iconBg: "bg-coral/10",
      iconColor: "text-coral",
      checkColor: "text-coral",
    },
    {
      id: "professional",
      name: "Plan Profesional",
      price: professionalPrice ? professionalPrice.unit_amount / 100 : 29,
      priceId: professionalPrice?.id,
      popular: true,
      description: "Ideal para profesionales consolidados",
      features: STRIPE_CONFIG.nutritionist.professional.features,
      maxPatients: null,
      icon: <Star className="h-6 w-6" />,
      cardStyle:
        "bg-sage-green/20 border-sage-green hover:border-sage-green/80 ring-2 ring-sage-green/30 shadow-xl",
      buttonStyle: "bg-sage-green hover:bg-sage-green/90 text-white",
      badgeStyle: "bg-sage-green text-white",
      iconBg: "bg-sage-green/10",
      iconColor: "text-sage-green",
      checkColor: "text-sage-green",
    },
    {
      id: "clinic",
      name: "Plan Clínica",
      price: clinicPrice ? clinicPrice.unit_amount / 100 : 99,
      priceId: clinicPrice?.id,
      popular: false,
      description: "Para clínicas y equipos grandes",
      features: STRIPE_CONFIG.nutritionist.clinic.features,
      maxPatients: null,
      icon: <Crown className="h-6 w-6" />,
      cardStyle:
        "bg-soft-rose/20 border-soft-rose hover:border-soft-rose/80 shadow-lg",
      buttonStyle:
        "bg-gradient-to-r from-soft-rose to-coral hover:from-soft-rose/90 hover:to-coral/90 text-white",
      badgeStyle: "bg-gradient-to-r from-soft-rose to-coral text-white",
      iconBg: "bg-soft-rose/10",
      iconColor: "text-soft-rose",
      checkColor: "text-soft-rose",
    },
  ];

  const handleSubscribe = async (
    priceId: string | null | undefined,
    planName: string,
  ) => {
    if (!priceId) {
      // Plan gratuito - no necesita pago
      alert("¡Ya estás en el plan gratuito! Puedes invitar hasta 5 pacientes.");
      return;
    }

    setLoadingPriceId(priceId);

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/dashboard?success=true&plan=${planName}`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
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
      setLoadingPriceId(null);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className={`relative p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${plan.cardStyle} ${
            plan.popular ? "scale-105" : ""
          }`}
        >
          {plan.popular && (
            <Badge
              className={`absolute -top-3 left-1/2 transform -translate-x-1/2 ${plan.badgeStyle} px-4 py-1`}
            >
              <Star className="h-3 w-3 mr-1" />
              Más Popular
            </Badge>
          )}

          <div className="text-center mb-6">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${plan.iconBg} mb-4`}
            >
              <div className={plan.iconColor}>{plan.icon}</div>
            </div>

            <h3 className="text-2xl font-bold text-charcoal mb-2">
              {plan.name}
            </h3>

            <p className="text-charcoal/70 mb-4">{plan.description}</p>

            <div className="mb-4">
              {plan.price === 0 ? (
                <div className="text-4xl font-bold text-charcoal">Gratis</div>
              ) : (
                <div>
                  <span className="text-4xl font-bold text-charcoal">
                    ${plan.price}
                  </span>
                  <span className="text-charcoal/70">/mes</span>
                </div>
              )}
            </div>

            <div className="text-sm text-charcoal/60 mb-6">
              {plan.maxPatients ? (
                <span>Hasta {plan.maxPatients} pacientes</span>
              ) : (
                <span className="text-sage-green font-semibold">
                  ✨ Pacientes ilimitados
                </span>
              )}
            </div>
          </div>

          <ul className="space-y-3 mb-8">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center text-charcoal/80">
                <Check
                  className={`h-5 w-5 mr-3 ${plan.checkColor} flex-shrink-0`}
                />

                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            onClick={() => handleSubscribe(plan.priceId, plan.name)}
            disabled={loadingPriceId === plan.priceId}
            className={`w-full transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 ${plan.buttonStyle} ${
              plan.popular ? "shadow-lg" : ""
            }`}
            size="lg"
          >
            {loadingPriceId === plan.priceId ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Procesando...
              </div>
            ) : (
              <div className="flex items-center">
                {plan.price === 0 ? "Plan Actual" : "Empezar Ahora"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            )}
          </Button>

          {plan.price > 0 && (
            <p className="text-xs text-charcoal/50 text-center mt-3">
              Puedes cancelar en cualquier momento
            </p>
          )}
        </Card>
      ))}
    </div>
  );
} 