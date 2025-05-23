import { Button } from "@/app/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Conéctate con tu nutricionista",
      description: "Tu nutricionista configura tu perfil con su enfoque preferido y filosofía dietética.",
    },
    {
      number: "02",
      title: "Comparte tus objetivos y desafíos",
      description: "Cuéntanos sobre tu viaje de salud, preferencias y con qué estás luchando.",
    },
    {
      number: "03",
      title: "Recibe coaching de IA personalizado",
      description: "Obtén orientación 24/7 alineada con las recomendaciones de tu nutricionista.",
    },
    {
      number: "04",
      title: "Sigue tu progreso y ajusta",
      description: "Monitorea tu viaje, celebra los logros y refina tu enfoque según sea necesario.",
    },
  ]

  return (
    <section id="how-it-works" className="py-16 md:py-24">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-marcellus text-charcoal mb-4">
            Cómo Funciona <span className="text-sage-green">NutriGuide</span>
          </h2>
          <p className="text-lg text-charcoal/70">
            Nuestro proceso simple asegura que recibas orientación alineada con expertos que se adapta a tus necesidades únicas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div className="bg-mist-white rounded-2xl p-8 shadow-sm">
            <div className="space-y-8">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-soft-rose/20 flex items-center justify-center">
                    <span className="font-marcellus text-coral">{step.number}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-marcellus text-charcoal mb-2">{step.title}</h3>
                    <p className="text-charcoal/70">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <h3 className="text-2xl font-marcellus text-charcoal mb-6">Por Qué las Mujeres Eligen NutriGuide</h3>
            <div className="space-y-4 mb-8">
              {[
                "Orientación que entiende las necesidades nutricionales únicas de las mujeres",
                "Apoyo que se adapta a vidas ocupadas y estresantes",
                "Aliento emocional, no solo consejos clínicos",
                "Nutrición simplificada sin información abrumadora",
                "Soporte consistente entre citas con el nutricionista",
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-sage-green flex-shrink-0 mt-0.5" />
                  <p className="text-charcoal/80">{benefit}</p>
                </div>
              ))}
            </div>
            <Button className="bg-coral hover:bg-coral/90 text-mist-white self-start rounded-full px-8 py-6">
              Comienza Tu Viaje
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
