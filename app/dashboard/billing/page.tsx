"use client";

import { useState } from "react";
import DashboardLayout from "@/app/components/dashboard-layout";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from "@/app/components/ui/page-transition";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import EmbeddedCheckoutButton from "@/app/components/EmbeddedCheckoutButton";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { 
  CreditCard, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  XCircle,
  ExternalLink,
  Loader2,
  Gift,
  Zap,
  Info,
  Shield,
  Crown
} from "lucide-react";
import { motion } from "framer-motion";

// Working checkout plans - same as test page
const workingCheckoutPlans = [
  {
    id: 'price_1RVDer4E1fMQUCHe1bi3YujU',
    name: 'NutriGuide Basic',
    amount: 1299, // $12.99
    currency: 'USD',
    interval: 'month',
    description: 'Essential nutrition guidance',
    features: ['Unlimited AI nutrition chat', 'Personalized meal plans', 'Progress tracking', 'Email support'],
    popular: false
  },
  {
    id: 'price_1RVDcc4E1fMQUCHeI84G5DZV',
    name: 'NutriGuide Pro',
    amount: 3999, // $39.99
    currency: 'USD',
    interval: 'month',
    description: 'Advanced coaching with premium features',
    features: ['Everything in Basic', 'Advanced analytics', 'Priority support', 'Custom recipes', 'Nutritionist chat'],
    popular: true
  }
];

export default function BillingPage() {
  const { user } = useAuth();
  const {
    subscription,
    price,
    loading,
    error,
    isTrialActive,
    trialDaysRemaining,
    subscriptionStatusText,
    formatPrice,
    createCustomerPortalSession,
    refetch,
  } = useSubscription();
  
  const [customAmount, setCustomAmount] = useState(1299); // $12.99
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [portalLoading, setPortalLoading] = useState(false);

  const formatPriceLocal = (amount: number) => {
    return (amount / 100).toFixed(2);
  };

  const handleOpenCustomerPortal = async () => {
    try {
      setPortalLoading(true);
      await createCustomerPortalSession();
    } catch (error) {
      console.error("Error opening customer portal:", error);
      alert(`Error al abrir portal: ${error}`);
    } finally {
      setPortalLoading(false);
    }
  };

  const getCurrentPlan = () => {
    if (!subscription || !price) return null;
    return workingCheckoutPlans.find(plan => plan.id === price.id);
  };

  const getAvailablePlans = () => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan) return workingCheckoutPlans;
    
    // Filter out current plan
    return workingCheckoutPlans.filter(plan => plan.id !== currentPlan.id);
  };

  const getStatusIcon = () => {
    if (isTrialActive) return <Gift className="w-5 h-5 text-blue-500" />;
    if (!subscription) return <XCircle className="w-5 h-5 text-gray-400" />;
    
    switch (subscription.status) {
      case "active":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "past_due":
      case "incomplete":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "canceled":
      case "unpaid":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = () => {
    if (isTrialActive) return "bg-blue-100 text-blue-800";
    if (!subscription) return "bg-gray-100 text-gray-800";
    
    switch (subscription.status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "past_due":
      case "incomplete":
        return "bg-yellow-100 text-yellow-800";
      case "canceled":
      case "unpaid":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-coral" />
            <span className="text-charcoal">Cargando información de facturación...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageTransition>
        <FadeIn>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-marcellus text-charcoal">
                  Facturación y Suscripciones
                </h1>
                <p className="text-charcoal/70 mt-2">
                  Gestiona tu suscripción y realiza pagos seguros
                </p>
              </div>
              
              {subscription && (
                <Button
                  onClick={handleOpenCustomerPortal}
                  disabled={portalLoading}
                  className="bg-coral hover:bg-coral/90 text-white"
                >
                  {portalLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Gestionar Suscripción
                    </>
                  )}
                </Button>
              )}
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Current Subscription Status */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-coral" />
                  Estado Actual de la Suscripción
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon()}
                    <div>
                      <p className="font-medium text-charcoal">
                        {subscription || isTrialActive ? "Acceso Activo" : "Sin Suscripción"}
                      </p>
                      <Badge className={getStatusColor()}>
                        {subscriptionStatusText}
                      </Badge>
                    </div>
                  </div>
                  
                  {price && (
                    <div className="text-right">
                      <p className="text-2xl font-bold text-charcoal">
                        {formatPrice ? formatPrice(price.unit_amount, price.currency) : `$${formatPriceLocal(price.unit_amount || 0)}`}
                      </p>
                      <p className="text-sm text-charcoal/60">
                        por {price.interval === "month" ? "mes" : "año"}
                      </p>
                    </div>
                  )}
                </div>

                {subscription && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-charcoal/60" />
                      <div>
                        <p className="text-sm text-charcoal/60">Próxima facturación</p>
                        <p className="font-medium text-charcoal">
                          {formatDate(subscription.current_period_end)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-charcoal/60" />
                      <div>
                        <p className="text-sm text-charcoal/60">Iniciada el</p>
                        <p className="font-medium text-charcoal">
                          {formatDate(subscription.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {isTrialActive && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <Gift className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>¡Período de prueba activo!</strong> Te quedan {trialDaysRemaining} días gratis.
                    </AlertDescription>
                  </Alert>
                )}

                {subscription?.cancel_at_period_end && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      Tu suscripción se cancelará el {formatDate(subscription.current_period_end)}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Subscription Plans */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-charcoal">
                  {subscription ? 'Cambiar Plan' : 'Planes de Suscripción'}
                </h2>
                
                {/* Current Plan Display */}
                {getCurrentPlan() && (
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Crown className="w-5 h-5 text-green-600" />
                          <CardTitle className="text-lg text-green-800">Plan Actual</CardTitle>
                        </div>
                        <Badge className="bg-green-600 text-white">Activo</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-green-800">{getCurrentPlan()?.name}</h3>
                        <p className="text-sm text-green-700">{getCurrentPlan()?.description}</p>
                        <p className="text-lg font-bold text-green-800">
                          ${formatPriceLocal(getCurrentPlan()?.amount || 0)}/mes
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Available Plans */}
                {getAvailablePlans().map((plan) => (
                  <motion.div
                    key={plan.id}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className={`hover:shadow-lg transition-shadow ${
                      plan.popular ? 'ring-2 ring-coral border-coral' : ''
                    }`}>
                      {plan.popular && (
                        <div className="bg-coral text-white text-center py-1 text-sm font-medium rounded-t-lg">
                          🌟 Más Popular
                        </div>
                      )}
                      
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg text-charcoal">{plan.name}</CardTitle>
                            <p className="text-sm text-charcoal/70 mt-1">{plan.description}</p>
                          </div>
                          <Badge 
                            variant="secondary"
                            className={plan.popular ? 'bg-coral/10 text-coral' : ''}
                          >
                            ${formatPriceLocal(plan.amount)}/mes
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {/* Features */}
                        <ul className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className="text-charcoal/80">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Checkout Button */}
                        <EmbeddedCheckoutButton
                          priceId={plan.id}
                          customerEmail={customerEmail || undefined}
                          buttonText={
                            subscription 
                              ? `Cambiar a ${plan.name} ($${formatPriceLocal(plan.amount)}/mes)`
                              : `Suscribirse por $${formatPriceLocal(plan.amount)}/mes`
                          }
                          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                            plan.popular
                              ? 'bg-coral hover:bg-coral/90 text-white'
                              : 'bg-charcoal hover:bg-charcoal/90 text-white'
                          }`}
                          metadata={{
                            plan_name: plan.name,
                            user_type: user?.role || 'patient',
                            source: 'dashboard_billing',
                            action: subscription ? 'plan_change' : 'new_subscription'
                          }}
                          onError={(error) => {
                            console.error('Checkout error:', error);
                            alert(`Error en el checkout: ${error}`);
                          }}
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Custom Payment */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-charcoal">Pago Personalizado</h2>
                
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-charcoal">Pago Único</CardTitle>
                    <p className="text-sm text-charcoal/70">Realiza un pago por cualquier monto</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email del Cliente</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="tu@email.com"
                        className="border-charcoal/20 focus:border-coral"
                      />
                    </div>

                    <div>
                      <Label htmlFor="amount">Monto (en centavos)</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(Number(e.target.value))}
                        placeholder="1299"
                        min="50"
                        step="1"
                        className="border-charcoal/20 focus:border-coral"
                      />
                      <p className="text-sm text-charcoal/60 mt-1">
                        Monto actual: ${formatPriceLocal(customAmount)} USD
                      </p>
                    </div>

                    <EmbeddedCheckoutButton
                      customAmount={customAmount}
                      customerEmail={customerEmail || undefined}
                      buttonText={`Pagar $${formatPriceLocal(customAmount)}`}
                      className="w-full bg-sage-green hover:bg-sage-green/90 text-white font-medium py-3 px-4 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
                      metadata={{
                        payment_type: 'custom_amount',
                        user_type: user?.role || 'patient',
                        source: 'dashboard_billing_custom'
                      }}
                      onError={(error) => {
                        console.error('Custom payment error:', error);
                        alert(`Error en el pago: ${error}`);
                      }}
                    />
                  </CardContent>
                </Card>

                {/* Test Card Info */}
                <Card className="bg-amber-50 border-amber-200">
                  <CardContent className="pt-6">
                    <h3 className="font-medium text-amber-900 mb-3 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Tarjetas de Prueba
                    </h3>
                    <div className="text-sm text-amber-800 space-y-2">
                      <div className="grid grid-cols-1 gap-1">
                        <p><code className="bg-amber-100 px-2 py-1 rounded">4242 4242 4242 4242</code> - Éxito</p>
                        <p><code className="bg-amber-100 px-2 py-1 rounded">4000 0000 0000 0002</code> - Rechazada</p>
                        <p><code className="bg-amber-100 px-2 py-1 rounded">4000 0000 0000 9995</code> - Fondos insuficientes</p>
                      </div>
                      <div className="pt-2 border-t border-amber-200">
                        <p><strong>Vencimiento:</strong> Cualquier fecha futura</p>
                        <p><strong>CVC:</strong> Cualquier 3 dígitos</p>
                        <p><strong>Código postal:</strong> Cualquier valor</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Current Status */}
                <Card className="bg-gray-50 border-gray-200">
                  <CardContent className="pt-6">
                    <h3 className="font-medium text-gray-900 mb-2">Estado Actual</h3>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p><strong>Usuario:</strong> {user?.name || 'No disponible'}</p>
                      <p><strong>Email:</strong> {user?.email || 'No disponible'}</p>
                      <p><strong>Rol:</strong> {user?.role || 'No disponible'}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Additional Info */}
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="space-y-2">
                  <p><strong>Sistema de Pagos Actualizado:</strong> Ahora funciona correctamente tanto para suscripciones como pagos únicos.</p>
                  <p className="text-sm">
                    Las suscripciones se procesan automáticamente y puedes gestionar tu plan desde el portal de cliente.
                    El sistema detecta tu estado actual y muestra las opciones apropiadas.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="outline" className="text-xs border-green-300 text-green-700">Suscripciones Funcionales</Badge>
                    <Badge variant="outline" className="text-xs border-green-300 text-green-700">Pagos Únicos</Badge>
                    <Badge variant="outline" className="text-xs border-green-300 text-green-700">Gestión de Estado</Badge>
                    <Badge variant="outline" className="text-xs border-green-300 text-green-700">Portal de Cliente</Badge>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </FadeIn>
      </PageTransition>
    </DashboardLayout>
  );
} 