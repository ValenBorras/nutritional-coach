import { Button } from "@/app/components/ui/button"
import Image from "next/image"

export default function HeroSection() {
  return (
    <section className="py-16 md:py-24 overflow-hidden">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-marcellus text-charcoal leading-tight mb-6">
              Tu <span className="text-coral">Nutricionista IA</span> Personal Que Se Adapta a Tus Necesidades
            </h1>
            <p className="text-lg md:text-xl text-charcoal/80 mb-8 leading-relaxed">
              NutriGuide ofrece coaching nutricional con IA 24/7 diseñado específicamente para mujeres mayores de 40 años. 
              Recibe orientación personalizada alineada con la filosofía de tu nutricionista y tu viaje único hacia la salud.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-coral hover:bg-coral/90 text-mist-white text-lg py-6 px-8 rounded-full">
                Comienza tu Viaje
              </Button>
              <Button
                variant="outline"
                className="border-sage-green text-charcoal hover:bg-sage-green/10 text-lg py-6 px-8 rounded-full"
              >
                Para Nutricionistas
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-4">
                <div className="w-10 h-10 rounded-full bg-soft-rose border-2 border-warm-sand flex items-center justify-center">
                  <span className="text-sm font-semibold">JM</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-sage-green border-2 border-warm-sand flex items-center justify-center">
                  <span className="text-sm font-semibold">KL</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-coral border-2 border-warm-sand flex items-center justify-center">
                  <span className="text-sm font-semibold">AS</span>
                </div>
              </div>
              <p className="text-charcoal/80">
                <span className="font-semibold">500+</span> mujeres ya mejorando su salud
              </p>
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="relative w-full aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 bg-soft-rose/20 rounded-full animate-float"></div>
              <div
                className="absolute inset-4 bg-sage-green/20 rounded-full animate-float"
                style={{ animationDelay: "1s" }}
              ></div>
              <div
                className="absolute inset-8 bg-coral/20 rounded-full animate-float overflow-hidden "
              >
                <Image
                  src="/nutricionista.webp"
                  alt="Mujer disfrutando comida saludable"
                  width={600}
                  height={600}
                  className="object-cover w-full h-full"
                  priority
                  sizes="(max-width: 768px) 300px, 400px"
                />
              </div>
            </div>
            <div
              className="absolute -bottom-4 -right-4 md:bottom-12 md:-right-8 bg-warm-sand border border-soft-rose p-4 rounded-lg shadow-md max-w-xs animate-float"
              style={{ animationDelay: "1.5s" }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-soft-rose flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold">AI</span>
                </div>
                <div>
                  <p className="text-sm text-charcoal/80">
                    "Noté que has tenido problemas para dormir. Intenta tomar una taza de té de manzanilla antes de acostarte y
                    evita las pantallas durante una hora antes de dormir."
                  </p>
                  <p className="text-xs text-charcoal/60 mt-1">Basado en las recomendaciones de la Dra. Sarah</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
