"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { 
  CreditCard, 
  Calendar, 
  Clock, 
  CheckCircle,
  ExternalLink,
  Gift
} from "lucide-react";

// Mock data for demonstration
const mockSubscription = {
  id: "sub_demo123",
  user_id: "user123",
  user_type: "patient" as const,
  stripe_customer_id: "cus_demo123",
  stripe_subscription_id: "sub_demo123",
  status: "active",
  price_id: "price_demo123",
  current_period_start: "2024-01-15T00:00:00Z",
  current_period_end: "2024-02-15T00:00:00Z",
  cancel_at_period_end: false,
  created_at: "2024-01-15T00:00:00Z",
  updated_at: "2024-01-15T00:00:00Z",
};

const mockPrice = {
  id: "price_demo123",
  product_id: "prod_demo123",
  user_type: "patient" as const,
  active: true,
  currency: "usd",
  unit_amount: 1299, // $12.99
  interval: "month",
  interval_count: 1,
  trial_period_days: 15,
  metadata: { name: "Plan Paciente" },
};

export function BillingDemo() {
  const formatPrice = (amount: number, currency: string = "usd") => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-2xl font-marcellus text-charcoal mb-2">
          🎭 Demo: Sistema de Facturación
        </h2>
        <p className="text-charcoal/70">
          Vista previa de cómo se verá la página de facturación con datos reales
        </p>
      </div>

      {/* Subscription Status */}
      <Card className="shadow-lg mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-coral" />
            Estado de la Suscripción
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-charcoal">Acceso Activo</p>
                <Badge className="bg-green-100 text-green-800">
                  Activa
                </Badge>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-2xl font-bold text-charcoal">
                {formatPrice(mockPrice.unit_amount, mockPrice.currency)}
              </p>
              <p className="text-sm text-charcoal/60">
                por {mockPrice.interval === "month" ? "mes" : "año"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-charcoal/60" />
              <div>
                <p className="text-sm text-charcoal/60">Próxima facturación</p>
                <p className="font-medium text-charcoal">
                  {formatDate(mockSubscription.current_period_end)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-charcoal/60" />
              <div>
                <p className="text-sm text-charcoal/60">Iniciada el</p>
                <p className="font-medium text-charcoal">
                  {formatDate(mockSubscription.created_at)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Information */}
      <Card className="shadow-lg mb-8">
        <CardHeader>
          <CardTitle>Información del Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current Plan Info */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-charcoal/70">Tipo de Usuario:</span>
                <Badge variant="outline">Paciente</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-charcoal/70">Plan:</span>
                <span className="font-medium">{mockPrice.metadata?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-charcoal/70">Facturación:</span>
                <span className="font-medium">Mensual</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-charcoal/70">Período de prueba:</span>
                <span className="font-medium">{mockPrice.trial_period_days} días</span>
              </div>
            </div>

            {/* Demo Available Plans Section */}
            <div className="border-t pt-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-coral/30 text-coral hover:bg-coral/10 mb-4"
                onClick={() => alert("En la versión real, esto mostraría/ocultaría los planes disponibles")}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Ver Planes Disponibles (Demo)
              </Button>

              {/* Mock Available Plans Preview */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-charcoal mb-3">
                  Vista previa de planes disponibles:
                </div>
                
                {/* Mock Plan 1 */}
                <Card className="border-coral/30 ring-2 ring-coral/20">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-charcoal text-sm">Plan Mensual</h4>
                              <Badge className="bg-coral text-white text-xs">Popular</Badge>
                              <Badge className="bg-green-100 text-green-800 text-xs">Actual</Badge>
                            </div>
                            <p className="text-xs text-charcoal/70 mt-1">
                              Acceso completo + Chat IA personalizado
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              🎁 15 días de prueba gratis
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="font-bold text-charcoal text-sm">
                            {formatPrice(mockPrice.unit_amount, mockPrice.currency)}
                          </div>
                          <div className="text-xs text-charcoal/60">por mes</div>
                        </div>
                        <Button size="sm" variant="outline" disabled>
                          Plan Actual
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Mock Plan 2 */}
                <Card className="border-gray-200 hover:border-coral/30">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="flex items-center space-x-2">
                          <Gift className="w-4 h-4 text-blue-500" />
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-charcoal text-sm">Plan Anual</h4>
                              <Badge className="bg-blue-100 text-blue-800 text-xs">Ahorro</Badge>
                            </div>
                            <p className="text-xs text-charcoal/70 mt-1">
                              2 meses gratis + Acceso completo
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="font-bold text-charcoal text-sm">$129.99</div>
                          <div className="text-xs text-charcoal/60">por año</div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => alert("En producción, esto iniciaría el checkout para el plan anual")}
                        >
                          Cambiar Plan
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="text-xs text-charcoal/60 mt-3 p-3 bg-blue-50 rounded-lg">
                  💡 <strong>Tip:</strong> Puedes cambiar o cancelar tu plan en cualquier momento desde aquí o desde el portal de pagos.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods & History */}
      <Card className="shadow-lg mb-8">
        <CardHeader>
          <CardTitle>Métodos de Pago e Historial</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-charcoal/40 mx-auto mb-4" />
            <p className="text-charcoal/60 mb-4">
              Gestiona tus métodos de pago y consulta tu historial de facturación
            </p>
            <Button
              variant="outline"
              className="border-coral text-coral hover:bg-coral hover:text-white"
              onClick={() => alert("En producción, esto abrirá el portal de Stripe")}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir Portal de Pagos (Demo)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Demo Trial Banner */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-lg mb-8">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Gift className="w-8 h-8 text-blue-500" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                🎯 Vista para Usuarios en Período de Prueba
              </h3>
              <p className="text-blue-800 text-sm mb-3">
                Los pacientes verán información sobre sus días restantes de prueba gratuita.
              </p>
              <div className="bg-blue-100 p-3 rounded-lg">
                <p className="text-blue-900 font-medium">
                  ¡Período de prueba activo! Te quedan 12 días gratis para explorar todas las funciones.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center text-sm text-charcoal/60 mt-12">
        <p>
          💡 <strong>Nota:</strong> Esta es una vista de demostración. 
          En producción, los datos se cargarán desde Supabase y Stripe.
        </p>
      </div>
    </div>
  );
} 