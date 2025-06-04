import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NutritionistPricingCards } from "@/app/components/nutritionist-pricing-cards";
import { PatientPricingCards } from "@/app/components/patient-pricing-cards";

// Simulated function to get prices - replace with actual Stripe integration
async function getActivePrices() {
  // Esto será reemplazado con llamadas reales a Stripe
  return [
    {
      id: "price_nutritionist_pro",
      product_id: "prod_nutritionist_pro",
      unit_amount: 2999, // $29.99
      currency: "usd",
      nickname: "Plan Profesional Nutricionista",
      user_type: "nutritionist" as const,
      active: true,
      interval: "month" as const,
      interval_count: 1,
      metadata: {},
    },
    {
      id: "price_nutritionist_clinic",
      product_id: "prod_nutritionist_clinic",
      unit_amount: 9900, // $99.00
      currency: "usd",
      nickname: "Plan Clínica Nutricionista",
      user_type: "nutritionist" as const,
      active: true,
      interval: "month" as const,
      interval_count: 1,
      metadata: {},
    },
    {
      id: "price_patient_monthly",
      product_id: "prod_patient_monthly",
      unit_amount: 1299, // $12.99
      currency: "usd",
      nickname: "Plan Mensual Paciente",
      user_type: "patient" as const,
      active: true,
      interval: "month" as const,
      interval_count: 1,
      metadata: {},
    },
  ];
}

export default async function PricingPage() {
  const supabase = await createClient();

  // Obtener usuario actual
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userType: "nutritionist" | "patient" | "guest" = "guest";

  if (user) {
    // Obtener perfil del usuario para determinar tipo
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    userType = profile?.user_type || "guest";
  }

  // Obtener precios activos
  const prices = await getActivePrices();

  return (
    <div className="min-h-screen bg-mist-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-charcoal mb-6">
            {userType === "patient"
              ? "Continúa tu transformación nutricional"
              : userType === "nutritionist"
                ? "Expande tu práctica con IA"
                : "Planes diseñados para ti"}
          </h1>
          <p className="text-xl text-charcoal/70 max-w-3xl mx-auto">
            {userType === "patient"
              ? "Mantén el acceso a tu asistente de IA personalizado y todas las herramientas premium"
              : userType === "nutritionist"
                ? "Atiende más pacientes y potencia tu práctica con inteligencia artificial avanzada"
                : "Elige el plan perfecto para tu rol en el ecosistema nutricional"}
          </p>
        </div>

        {/* Pricing Cards basadas en tipo de usuario */}
        <div className="mb-16">
          {userType === "patient" ? (
            <PatientPricingCards prices={prices} />
          ) : userType === "nutritionist" ? (
            <NutritionistPricingCards prices={prices} />
          ) : (
            // Usuario no autenticado - mostrar ambos
            <div className="space-y-20">
              {/* Sección para Nutricionistas */}
              <div>
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-charcoal mb-4">
                    👨‍⚕️ Para Nutricionistas
                  </h2>
                  <p className="text-lg text-charcoal/70">
                    Expande tu práctica y atiende más pacientes con IA
                  </p>
                </div>
                <NutritionistPricingCards prices={prices} />
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-charcoal/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-6 bg-mist-white text-charcoal/60">y</span>
                </div>
              </div>

              {/* Sección para Pacientes */}
              <div>
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-charcoal mb-4">
                    👤 Para Pacientes
                  </h2>
                  <p className="text-lg text-charcoal/70">
                    Recibe orientación nutricional personalizada 24/7
                  </p>
                </div>
                <PatientPricingCards prices={prices} />
              </div>
            </div>
          )}
        </div>

        {/* FAQ Section */}
        <div className="bg-warm-sand/30 rounded-2xl p-8 mb-16">
          <h3 className="text-3xl font-bold text-charcoal text-center mb-8">
            Preguntas Frecuentes
          </h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h4 className="font-semibold text-charcoal mb-2">
                ¿Puedo cancelar en cualquier momento?
              </h4>
              <p className="text-charcoal/70 text-sm">
                Sí, puedes cancelar tu suscripción en cualquier momento sin
                penalizaciones. Tu acceso continuará hasta el final del período
                facturado.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-charcoal mb-2">
                ¿Qué incluye el trial gratuito?
              </h4>
              <p className="text-charcoal/70 text-sm">
                El trial de 15 días incluye acceso completo a todas las
                funciones premium sin restricciones.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-charcoal mb-2">
                ¿Cómo funciona la conexión nutricionista-paciente?
              </h4>
              <p className="text-charcoal/70 text-sm">
                Los nutricionistas generan códigos únicos que los pacientes usan
                para conectarse. La IA se sincroniza automáticamente con las
                directrices del profesional.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-charcoal mb-2">
                ¿Hay descuentos por volumen?
              </h4>
              <p className="text-charcoal/70 text-sm">
                Ofrecemos descuentos especiales para clínicas con múltiples
                nutricionistas. Contacta nuestro equipo de ventas para más
                información.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-sage-green to-coral rounded-2xl p-8 text-white">
            <h3 className="text-3xl font-bold mb-4">
              ¿Listo para transformar la nutrición?
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Únete a miles de profesionales y pacientes que ya confían en
              NutriGuide
            </p>
            {!user && (
              <div className="space-x-4">
                <a
                  href="/register?type=nutritionist"
                  className="bg-white text-sage-green px-6 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors inline-block"
                >
                  Soy Nutricionista
                </a>
                <a
                  href="/register?type=patient"
                  className="bg-white/10 border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors inline-block"
                >
                  Soy Paciente
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
