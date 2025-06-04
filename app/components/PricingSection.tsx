"use client";

import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Check, Star, Crown, Zap, ArrowRight, Heart, Gift } from "lucide-react";
import Link from "next/link";

export default function PricingSection() {
  const nutritionistPlans = [
    {
      name: "Gratuito",
      price: 0,
      description: "Perfecto para empezar",
      maxPatients: 5,
      icon: <Zap className="h-6 w-6" />,
      features: [
        "Hasta 5 pacientes",
        "Chat con IA básico",
        "Panel básico",
        "Soporte email",
      ],

      popular: false,
      color: "coral",
    },
    {
      name: "Profesional",
      price: 29,
      description: "Para profesionales consolidados",
      maxPatients: null,
      icon: <Star className="h-6 w-6" />,
      features: [
        "Pacientes ilimitados",
        "IA personalizada avanzada",
        "Analytics detallados",
        "Soporte prioritario",
      ],

      popular: true,
      color: "sage-green",
    },
    {
      name: "Clínica",
      price: 99,
      description: "Para equipos grandes",
      maxPatients: null,
      icon: <Crown className="h-6 w-6" />,
      features: [
        "Todo lo anterior",
        "Múltiples nutricionistas",
        "Dashboard administrativo",
        "API access",
      ],

      popular: false,
      color: "soft-rose",
    },
  ];

  const patientPlan = {
    name: "Plan Paciente",
    price: 12.99,
    trial: 15,
    description: "Orientación nutricional 24/7",
    icon: <Heart className="h-6 w-6" />,
    features: [
      "Chat personalizado con IA 24/7",
      "Seguimiento nutricional completo",
      "Plan de comidas personalizado",
      "Sincronización con nutricionista",
    ],
  };

  return (
    <section className="py-20 bg-mist-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-charcoal mb-6">
            Planes diseñados para cada necesidad
          </h2>
          <p className="text-xl text-charcoal/70 max-w-3xl mx-auto">
            Desde profesionales independientes hasta grandes clínicas, tenemos
            el plan perfecto para impulsar tu práctica
          </p>
        </div>

        {/* Nutricionistas Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-charcoal mb-4">
              👨‍⚕️ Para Nutricionistas
            </h3>
            <p className="text-lg text-charcoal/70">
              Expande tu práctica y atiende más pacientes con IA
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {nutritionistPlans.map((plan, index) => (
              <Card
                key={index}
                className={`relative p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                  plan.color === "coral"
                    ? "bg-warm-sand border-coral/30 hover:border-coral"
                    : plan.color === "sage-green"
                      ? "bg-sage-green/10 border-sage-green/30 hover:border-sage-green ring-2 ring-sage-green/20"
                      : "bg-soft-rose/10 border-soft-rose/30 hover:border-soft-rose"
                } ${plan.popular ? "scale-105 shadow-xl" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-sm font-semibold bg-sage-green text-white">
                    <Star className="h-3 w-3 mr-1 inline" />
                    Más Popular
                  </div>
                )}

                <div className="text-center mb-6">
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
                      plan.color === "coral"
                        ? "bg-coral/10 text-coral"
                        : plan.color === "sage-green"
                          ? "bg-sage-green/10 text-sage-green"
                          : "bg-soft-rose/20 text-soft-rose"
                    }`}
                  >
                    {plan.icon}
                  </div>

                  <h4 className="text-xl font-bold text-charcoal mb-2">
                    {plan.name}
                  </h4>

                  <p className="text-charcoal/70 text-sm mb-4">
                    {plan.description}
                  </p>

                  <div className="mb-4">
                    {plan.price === 0 ? (
                      <div className="text-3xl font-bold text-charcoal">
                        Gratis
                      </div>
                    ) : (
                      <div>
                        <span className="text-3xl font-bold text-charcoal">
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

                <ul className="space-y-2 mb-6">
                  {plan.features.slice(0, 4).map((feature, fIndex) => (
                    <li
                      key={fIndex}
                      className="flex items-center text-charcoal/80 text-sm"
                    >
                      <Check
                        className={`h-4 w-4 mr-2 flex-shrink-0 ${
                          plan.color === "coral"
                            ? "text-coral"
                            : plan.color === "sage-green"
                              ? "text-sage-green"
                              : "text-soft-rose"
                        }`}
                      />

                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    plan.color === "coral"
                      ? "bg-coral hover:bg-coral/90 text-white"
                      : plan.color === "sage-green"
                        ? "bg-sage-green hover:bg-sage-green/90 text-white"
                        : "bg-gradient-to-r from-soft-rose to-coral hover:from-soft-rose/90 hover:to-coral/90 text-white"
                  }`}
                  size="sm"
                  asChild
                >
                  <Link href="/pricing">
                    {plan.price === 0 ? "Comenzar Gratis" : "Elegir Plan"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="relative mb-20">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-charcoal/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-mist-white text-charcoal/60">
              Y también
            </span>
          </div>
        </div>

        {/* Pacientes Section */}
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-charcoal mb-4">
              👤 Para Pacientes
            </h3>
            <p className="text-lg text-charcoal/70">
              Orientación nutricional personalizada 24/7
            </p>
          </div>

          <Card className="p-8 bg-gradient-to-br from-coral/5 to-soft-rose/10 border-coral/20 hover:border-coral/40 transition-all duration-300 hover:shadow-lg">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-coral/10 text-coral mb-6">
                {patientPlan.icon}
              </div>

              <h4 className="text-2xl font-bold text-charcoal mb-2">
                {patientPlan.name}
              </h4>

              <p className="text-charcoal/70 mb-6">{patientPlan.description}</p>

              <div className="mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Gift className="h-5 w-5 text-coral" />
                  <span className="text-lg font-semibold text-coral">
                    {patientPlan.trial} días gratis
                  </span>
                </div>
                <div>
                  <span className="text-3xl font-bold text-charcoal">
                    ${patientPlan.price}
                  </span>
                  <span className="text-charcoal/70">
                    /mes después del trial
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 text-left max-w-md mx-auto">
                {patientPlan.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center text-charcoal/80"
                  >
                    <Check className="h-4 w-4 mr-3 text-coral flex-shrink-0" />

                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="bg-coral hover:bg-coral/90 text-white px-8 py-3"
                size="lg"
                asChild
              >
                <Link href="/pricing">
                  Comenzar Trial Gratuito
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </Card>
        </div>

        {/* CTA Final */}
        <div className="text-center mt-16">
          <p className="text-charcoal/60 mb-4">
            ¿Tienes dudas sobre qué plan elegir?
          </p>
          <Button variant="outline" asChild>
            <Link href="/pricing">
              Ver comparación completa
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
