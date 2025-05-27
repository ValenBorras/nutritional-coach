import { Button } from "@/app/components/ui/button"

export default function CTASection() {
  return (
    <section className="py-16 md:py-24 bg-soft-rose/20">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-marcellus text-charcoal mb-6">
            Comienza Tu Viaje Hacia una <span className="text-coral">Mejor Salud</span> Hoy
          </h2>
          <p className="text-lg text-charcoal/70 mb-8">
            Únete a miles de personas que están transformando su relación con la nutrición a través de una
            orientación personalizada y alineada con expertos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-coral hover:bg-coral/90 text-mist-white text-lg py-6 px-8 rounded-full">
              Comienza Tu Prueba Gratuita
            </Button>
            <Button
              variant="outline"
              className="border-sage-green text-charcoal hover:bg-sage-green/10 text-lg py-6 px-8 rounded-full"
            >
              Agenda una Demo
            </Button>
          </div>
          <p className="text-sm text-charcoal/60 mt-6">No se requiere tarjeta de crédito. Prueba gratuita de 14 días.</p>
        </div>
      </div>
    </section>
  )
}
