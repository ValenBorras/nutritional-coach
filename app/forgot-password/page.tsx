import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"

export const metadata: Metadata = {
  title: "Recuperar Contraseña - NutriGuide",
  description: "Recupera el acceso a tu cuenta de NutriGuide.",
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-sand py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-soft-rose flex items-center justify-center">
              <span className="font-marcellus text-xl text-charcoal">NG</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-marcellus text-center text-charcoal">
            Recupera Tu Contraseña
          </CardTitle>
          <CardDescription className="text-center text-charcoal/70">
            Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-charcoal">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                className="bg-mist-white border-soft-rose/20 focus:border-coral"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-coral hover:bg-coral/90 text-mist-white py-6"
            >
              Enviar Instrucciones
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-coral hover:text-coral/90 transition-colors"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 