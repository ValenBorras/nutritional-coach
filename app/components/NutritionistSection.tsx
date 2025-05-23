import { Button } from "@/app/components/ui/button"
import { Card, CardContent } from "@/app/components/ui/card"
import { Settings, Users, TrendingUp } from "lucide-react"

export default function NutritionistSection() {
  return (
    <section id="for-nutritionists" className="py-16 md:py-24">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-marcellus text-charcoal mb-6">
              Para <span className="text-sage-green">Nutricionistas</span>: Extiende Tu Cuidado Más Allá de las Citas
            </h2>
            <p className="text-lg text-charcoal/70 mb-8">
              NutriGuide te ayuda a brindar soporte continuo a tus clientes mientras mantienes tu enfoque y filosofía únicos. 
              Configura la IA para alinearse con tus recomendaciones y monitorea el progreso de tus clientes.
            </p>

            <div className="space-y-6 mb-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-sage-green/20 flex items-center justify-center flex-shrink-0">
                  <Settings className="w-6 h-6 text-sage-green" />
                </div>
                <div>
                  <h3 className="text-xl font-marcellus text-charcoal mb-2">Configura Tu Asistente de IA</h3>
                  <p className="text-charcoal/70">
                    Personaliza la IA para reflejar tu filosofía dietética y enfoques preferidos.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-soft-rose/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-soft-rose" />
                </div>
                <div>
                  <h3 className="text-xl font-marcellus text-charcoal mb-2">Invita a Tus Clientes</h3>
                  <p className="text-charcoal/70">
                    Incorpora a tus clientes de manera fluida para recibir orientación de IA alineada con tu cuidado.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-coral/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-coral" />
                </div>
                <div>
                  <h3 className="text-xl font-marcellus text-charcoal mb-2">Monitorea el Progreso</h3>
                  <p className="text-charcoal/70">
                    Rastrea el compromiso y los resultados de tus clientes para optimizar tus sesiones presenciales.
                  </p>
                </div>
              </div>
            </div>

            <Button className="bg-sage-green hover:bg-sage-green/90 text-mist-white rounded-full px-8 py-6">
              Únete como Nutricionista
            </Button>
          </div>

          <div className="flex-1 relative">
            <div className="bg-mist-white rounded-2xl p-6 border border-sage-green/20 shadow-sm max-w-md mx-auto">
              <div className="mb-6">
                <h3 className="font-marcellus text-xl text-charcoal mb-2">Panel de Nutricionista</h3>
                <p className="text-sm text-charcoal/70">Configura tu asistente de IA y monitorea el progreso de tus clientes</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-warm-sand p-4 rounded-lg">
                  <h4 className="font-semibold text-charcoal mb-2">Filosofía Dietética</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Mediterránea", "Basada en Plantas", "Baja en Carbohidratos", "Alimentación Intuitiva", "Antiinflamatoria"].map(
                      (tag, i) => (
                        <span key={i} className="bg-soft-rose/20 text-charcoal px-3 py-1 rounded-full text-sm">
                          {tag}
                        </span>
                      ),
                    )}
                  </div>
                </div>

                <div className="bg-warm-sand p-4 rounded-lg">
                  <h4 className="font-semibold text-charcoal mb-2">Actividad de Clientes</h4>
                  <div className="space-y-3">
                    {[
                      { name: "Jennifer M.", status: "Activa hoy", progress: 75 },
                      { name: "Sarah T.", status: "Activa ayer", progress: 60 },
                      { name: "Michelle K.", status: "Activa hace 3 días", progress: 40 },
                    ].map((client, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-charcoal">{client.name}</p>
                          <p className="text-xs text-charcoal/60">{client.status}</p>
                        </div>
                        <div className="w-20 h-2 bg-soft-rose/20 rounded-full overflow-hidden">
                          <div className="h-full bg-coral rounded-full" style={{ width: `${client.progress}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full border-sage-green text-sage-green hover:bg-sage-green/10">
                Ver Panel Completo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
