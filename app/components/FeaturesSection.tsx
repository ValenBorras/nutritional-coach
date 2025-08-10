import { Heart, Clock, MessageSquare, Sparkles, Zap, UserCheck } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: <Heart className="w-10 h-10 text-coral" />,
      title: "Orientación Personalizada",
      description:
        "Recibe consejos nutricionales adaptados a tus necesidades específicas, preferencias y objetivos de salud.",
    },
    {
      icon: <Clock className="w-10 h-10 text-sage-green" />,
      title: "Soporte 24/7",
      description:
        "Accede a tu coach nutricional de IA en cualquier momento y lugar, perfecto para agendas ocupadas.",
    },
    {
      icon: <MessageSquare className="w-10 h-10 text-soft-rose" />,

      title: "Coaching de Apoyo",
      description:
        "Recibe aliento y apoyo emocional durante todo tu viaje hacia la salud.",
    },
    {
      icon: <Sparkles className="w-10 h-10 text-coral" />,
      title: "Alineado con Expertos",
      description:
        "Orientación de IA que sigue la filosofía y recomendaciones de tu nutricionista.",
    },
    {
      icon: <Zap className="w-10 h-10 text-sage-green" />,
      title: "Simple e Intuitivo",
      description:
        "Interfaz fácil de usar diseñada para personas que buscan resultados sin complicaciones.",
    },
    {
      icon: <UserCheck className="w-10 h-10 text-soft-rose" />,

      title: "Seguimiento de Progreso",
      description:
        "Monitorea tu viaje con herramientas intuitivas que celebran cada logro.",
    },
  ];

  return (
    <section id="features" className="py-16 md:py-24 bg-mist-white">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-marcellus text-charcoal mb-4">
            Apoyo Nutricional Que Te{" "}
            <span className="text-coral">Entiende</span>
          </h2>
          <p className="text-lg text-charcoal/70">
            NutriGuide combina la experiencia de tu nutricionista con la
            conveniencia de la IA para brindarte apoyo personalizado exactamente
            cuando lo necesitas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-warm-sand p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-soft-rose/10"
            >
              <div className="mb-4 p-3 inline-block rounded-full bg-mist-white">
                {feature.icon}
              </div>
              <h3 className="text-xl font-marcellus text-charcoal mb-3">
                {feature.title}
              </h3>
              <p className="text-charcoal/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
