import { Card, CardContent } from "@/app/components/ui/card"
import { Quote } from "lucide-react"

export default function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "NutriGuide ha sido como tener a mi nutricionista en mi bolsillo 24/7. La orientación está tan alineada con lo que recomienda mi médico, pero puedo obtener ayuda en cualquier momento que lo necesite.",
      name: "Jennifer M.",
      age: 42,
      achievement: "Perdió 7 kilos en 3 meses",
    },
    {
      quote:
        "Como padre ocupado que trabaja muchas horas, siempre descuidaba mi alimentación. NutriGuide me ayuda a mantener hábitos saludables con consejos prácticos que puedo seguir incluso en días caóticos. Es como tener un nutricionista personal.",
      name: "Carlos R.",
      age: 35,
      achievement: "Aumentó masa muscular y energía",
    },
    {
      quote:
        "El apoyo emocional es lo que lo hace diferente. No se trata solo de qué comer, sino de entender por qué lucho y ayudarme en momentos difíciles con compasión.",
      name: "Michelle K.",
      age: 51,
      achievement: "Manejando síntomas de menopausia",
    },
    {
      quote:
        "He probado muchas aplicaciones de dieta, pero todas se sentían genéricas. NutriGuide realmente sigue el enfoque de mi nutricionista, así que no recibo consejos contradictorios. Ha sido un cambio total.",
      name: "Patricia L.",
      age: 47,
      achievement: "Reducción de inflamación",
    },
  ]

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-sage-green/10">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-marcellus text-charcoal mb-4">
            Historias de <span className="text-coral">Personas Como Tú</span>
          </h2>
          <p className="text-lg text-charcoal/70">
            Escucha a personas que han transformado su relación con la nutrición usando NutriGuide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-warm-sand border-soft-rose/20 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <Quote className="w-10 h-10 text-soft-rose mb-4" />
                <p className="text-charcoal/80 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-soft-rose flex items-center justify-center">
                    <span className="font-semibold text-charcoal">
                      {testimonial.name.split(" ")[0][0]}
                      {testimonial.name.split(" ")[1][0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal">
                      {testimonial.name}, {testimonial.age}
                    </p>
                    <p className="text-sm text-sage-green">{testimonial.achievement}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
