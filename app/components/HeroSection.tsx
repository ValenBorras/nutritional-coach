import { Button } from "@/app/components/ui/button"
import Image from "next/image"
import Link from "next/link"

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
              NutriGuide ofrece coaching nutricional con IA 24/7 para personas que buscan cambiar su físico y alcanzar sus objetivos de alimentación. 
              Recibe orientación personalizada alineada con la filosofía de tu nutricionista y tu viaje único hacia la salud.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login">
                <Button className="bg-coral hover:bg-coral/90 text-mist-white text-lg py-6 px-8 rounded-full">
                  Comienza tu Viaje
                </Button>
              </Link>
              <Link href="/#for-nutritionists">
                <Button
                  variant="outline"
                  className="border-sage-green text-charcoal hover:bg-sage-green/10 text-lg py-6 px-8 rounded-full"
                >
                  Para Nutricionistas
                </Button>
              </Link>
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
                <span className="font-semibold">500+</span> personas ya mejorando su salud
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
                  alt="Persona disfrutando comida saludable"
                  width={600}
                  height={600}
                  className="object-cover w-full h-full"
                  priority
                  sizes="(max-width: 768px) 300px, 400px"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
