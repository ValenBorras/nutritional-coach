import { Metadata } from "next"
import DashboardLayout from "@/app/components/dashboard-layout"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { Camera, Save } from "lucide-react"

export const metadata: Metadata = {
  title: "Configuración - NutriGuide",
  description: "Administra tu perfil y preferencias en NutriGuide.",
}

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-marcellus text-charcoal">Configuración</h1>
          <Button className="bg-coral hover:bg-coral/90 text-mist-white gap-2">
            <Save size={16} />
            Guardar Cambios
          </Button>
        </div>

        <Card className="bg-warm-sand border-soft-rose/20">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
                  <AvatarFallback className="bg-soft-rose text-charcoal text-2xl">JD</AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 rounded-full border-soft-rose/20 bg-warm-sand hover:bg-soft-rose/10"
                >
                  <Camera size={16} />
                </Button>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-charcoal mb-1">Foto de Perfil</h3>
                <p className="text-sm text-charcoal/70">
                  Sube una foto para personalizar tu perfil. Formatos aceptados: JPG, PNG.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-charcoal">Nombre</Label>
                <Input
                  id="firstName"
                  defaultValue="Jane"
                  className="bg-mist-white border-soft-rose/20 focus:border-coral"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-charcoal">Apellido</Label>
                <Input
                  id="lastName"
                  defaultValue="Doe"
                  className="bg-mist-white border-soft-rose/20 focus:border-coral"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-charcoal">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue="jane.doe@example.com"
                  className="bg-mist-white border-soft-rose/20 focus:border-coral"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-charcoal">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+34 123 456 789"
                  className="bg-mist-white border-soft-rose/20 focus:border-coral"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-warm-sand border-soft-rose/20">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Preferencias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="language" className="text-charcoal">Idioma</Label>
              <select
                id="language"
                className="w-full px-3 py-2 bg-mist-white border border-soft-rose/20 rounded-md focus:outline-none focus:ring-2 focus:ring-soft-rose/50 text-charcoal"
                defaultValue="es"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notifications" className="text-charcoal">Notificaciones</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-soft-rose/20 text-coral focus:ring-coral" defaultChecked />
                  <span className="text-charcoal">Recordatorios de comidas</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-soft-rose/20 text-coral focus:ring-coral" defaultChecked />
                  <span className="text-charcoal">Actualizaciones de progreso</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-soft-rose/20 text-coral focus:ring-coral" defaultChecked />
                  <span className="text-charcoal">Mensajes de tu nutricionista</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-warm-sand border-soft-rose/20">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-red-500">Zona de Peligro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-charcoal/70">
                Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, ten cuidado.
              </p>
              <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10">
                Eliminar Cuenta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
} 