"use client";

import { useState } from "react";
import DashboardLayout from "@/app/components/dashboard-layout";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { PageTransition, FadeIn } from "@/app/components/ui/page-transition";
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
  Shield,
  Crown,
  Star,
  Zap,
  Users,
  Brain
} from "lucide-react";
import { motion } from "framer-motion";

// Planes para pacientes
const PATIENT_PLAN = {
  id: 'price_1RVDer4E1fMQUCHe1bi3YujU',
  name: 'NutriGuide Basic',
  amount: 1299, // $12.99
  currency: 'USD',
  interval: 'month',
  description: 'Tu nutricionista personal con IA las 24 horas',
  trial_days: 15,
  popular: true, // Popular for patients
  isFree: false,
  features: [
    'Chat ilimitado con IA nutricional personalizada',
    'Planes de comidas adaptados a tus gustos',
    'Seguimiento de progreso y objetivos',
    'Sincronización con tu nutricionista',
    'Notificaciones y recordatorios',
    'Soporte técnico incluido'
  ]
};

// Planes para nutricionistas
const NUTRITIONIST_PLANS = [
  {
    id: 'price_1RVDaj4E1fMQUCHehmZgPtIt', // Free plan
    name: 'Plan Gratuito',
    amount: 0,
    currency: 'USD',
    interval: 'month',
    description: 'Perfecto para empezar',
    trial_days: 0, // No trial for free plan
    features: [
      'Hasta 5 pacientes',
      'Chat básico con IA',
      'Panel de control básico',
      'Soporte por email'
    ],
    popular: false,
    isFree: true
  },
  {
    id: 'price_1RVDcc4E1fMQUCHeI84G5DZV',
    name: 'Plan Profesional',
    amount: 3999, // $39.99
    currency: 'USD',
    interval: 'month',
    description: 'Para nutricionistas que crecen',
    trial_days: 0, // No trial for professional plan
    features: [
      'Pacientes ilimitados',
      'IA personalizada avanzada',
      'Analytics detallados',
      'Exportar conversaciones',
      'Soporte prioritario',
      'API access básico'
    ],
    popular: true,
    isFree: false
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

  const handleSubscriptionSuccess = () => {
    // Refrescar datos después del pago
    console.log('🔄 Refrescando datos de suscripción...');
    setTimeout(() => {
      refetch();
    }, 3000); // Dar más tiempo para que se procese el webhook
    
    // Reload completo después de un tiempo más largo
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  };

  const isCurrentlySubscribed = subscription && (subscription.status === 'active' || subscription.status === 'trialing');
  const hasActiveAccess = isCurrentlySubscribed || isTrialActive;
  
  // Determinar qué planes mostrar según el tipo de usuario
  const isPatient = user?.role === 'patient';
  const isNutritionist = user?.role === 'nutritionist';
  
  const getAvailablePlans = () => {
    if (isPatient) {
      return [PATIENT_PLAN];
    } else if (isNutritionist) {
      // Filtrar el plan actual si ya está suscrito
      const currentPriceId = subscription?.price_id;
      return NUTRITIONIST_PLANS.filter(plan => plan.id !== currentPriceId);
    }
    return [];
  };

  const getCurrentPlan = () => {
    if (!subscription || !price) return null;
    
    if (isPatient) {
      return PATIENT_PLAN.id === price.id ? PATIENT_PLAN : null;
    } else if (isNutritionist) {
      return NUTRITIONIST_PLANS.find(plan => plan.id === price.id);
    }
    return null;
  };

  const getStatusIcon = () => {
    if (isTrialActive) return <Gift className="w-5 h-5 text-blue-500" />;
    if (!subscription) return <XCircle className="w-5 h-5 text-gray-400" />;
    
    switch (subscription.status) {
      case "active":
      case "trialing":
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
      case "trialing":
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
            <span className="text-charcoal">Cargando información de suscripción...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const availablePlans = getAvailablePlans();
  const currentPlan = getCurrentPlan();

  return (
    <DashboardLayout>
      <PageTransition>
        <FadeIn>
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-3xl font-marcellus text-charcoal mb-2">
                {isPatient ? 'Tu Suscripción NutriGuide' : 'Planes para Nutricionistas'}
              </h1>
              <p className="text-charcoal/70">
                {isPatient 
                  ? 'Acceso completo a tu nutricionista personal con IA'
                  : 'Herramientas profesionales para hacer crecer tu práctica'
                }
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                {isPatient ? (
                  <><Users className="w-4 h-4 text-coral" /><span className="text-sm text-coral font-medium">Paciente</span></>
                ) : (
                  <><Brain className="w-4 h-4 text-sage-green" /><span className="text-sm text-sage-green font-medium">Nutricionista</span></>
                )}
              </div>
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
                  Estado de tu Suscripción
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon()}
                    <div>
                      <p className="font-medium text-charcoal">
                        {hasActiveAccess ? "Acceso Activo" : "Sin Suscripción"}
                      </p>
                      <Badge className={getStatusColor()}>
                        {subscriptionStatusText || "No suscrito"}
                      </Badge>
                    </div>
                  </div>
                  
                  {hasActiveAccess && currentPlan && (
                    <div className="text-right">
                      <p className="text-2xl font-bold text-charcoal">
                        ${formatPriceLocal(currentPlan.amount)}
                      </p>
                      <p className="text-sm text-charcoal/60">por mes</p>
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

                {/* Customer Portal Button */}
                {isCurrentlySubscribed && (
                  <div className="pt-4 border-t">
                    <Button
                      onClick={handleOpenCustomerPortal}
                      disabled={portalLoading}
                      className="bg-coral hover:bg-coral/90 text-white w-full md:w-auto"
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
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Plan Display */}
            {currentPlan && (
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
                  <div className="space-y-3">
                    <h3 className="font-semibold text-green-800">{currentPlan.name}</h3>
                    <p className="text-sm text-green-700">{currentPlan.description}</p>
                    <p className="text-xl font-bold text-green-800">
                      {currentPlan.amount === 0 ? 'Gratis' : `$${formatPriceLocal(currentPlan.amount)}/mes`}
                    </p>
                    <p className="text-sm text-green-600">
                      🎉 ¡Tienes acceso completo a todas las funciones de este plan!
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Available Plans */}
            {availablePlans.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-charcoal text-center">
                  {isCurrentlySubscribed ? 'Cambiar Plan' : 
                   isPatient ? 'Comienza tu Transformación Nutricional' : 'Elige tu Plan Profesional'}
                </h2>
                
                <div className="grid gap-6">
                  {availablePlans.map((plan) => (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Card className={`shadow-xl border-2 ${
                        plan.popular 
                          ? 'border-coral/20 bg-gradient-to-br from-white to-coral/5' 
                          : plan.isFree
                          ? 'border-gray-200 bg-gradient-to-br from-white to-gray-50'
                          : 'border-sage-green/20 bg-gradient-to-br from-white to-sage-green/5'
                      }`}>
                        <CardHeader className="text-center pb-2">
                          {plan.popular && (
                            <div className="flex justify-center mb-3">
                              <div className="bg-coral text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                                <Star className="w-4 h-4" />
                                Más Popular
                              </div>
                            </div>
                          )}
                          
                          {isPatient && (
                            <div className="flex justify-center mb-3">
                              <div className="bg-coral text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                                <Star className="w-4 h-4" />
                                ¡15 días gratis!
                              </div>
                            </div>
                          )}
                          
                          <CardTitle className="text-2xl text-charcoal flex items-center justify-center gap-2">
                            <Zap className="w-6 h-6 text-coral" />
                            {plan.name}
                          </CardTitle>
                          <p className="text-charcoal/70 mt-2">{plan.description}</p>
                        </CardHeader>
                        
                        <CardContent className="space-y-6">
                          {/* Pricing */}
                          <div className="text-center">
                            <div className="text-4xl font-bold text-charcoal">
                              {plan.amount === 0 ? (
                                'Gratis'
                              ) : (
                                <>
                                  ${formatPriceLocal(plan.amount)}
                                  <span className="text-lg font-normal text-charcoal/60">/mes</span>
                                </>
                              )}
                            </div>
                            {isPatient && plan.trial_days && (
                              <p className="text-coral font-medium mt-1">
                                Primeros {plan.trial_days} días GRATIS
                              </p>
                            )}
                          </div>

                          {/* Features */}
                          <div className="space-y-3">
                            <h3 className="font-semibold text-charcoal text-center">¿Qué incluye?</h3>
                            <ul className="space-y-2">
                              {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-start gap-3">
                                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span className="text-charcoal/80">{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Trial Info for Patients */}
                          {isPatient && (
                            <Alert className="border-green-200 bg-green-50">
                              <Gift className="h-4 w-4 text-green-600" />
                              <AlertDescription className="text-green-800">
                                <strong>Sin compromisos:</strong> Prueba todas las funciones gratis por 15 días. 
                                Puedes cancelar en cualquier momento desde tu panel de gestión.
                              </AlertDescription>
                            </Alert>
                          )}

                          {/* Subscribe Button */}
                          <div className="pt-2">
                            {plan.isFree ? (
                              <Button
                                disabled
                                className="w-full bg-gray-400 text-white py-4 px-6 rounded-xl"
                              >
                                Plan Actual (Gratuito)
                              </Button>
                            ) : (
                              <EmbeddedCheckoutButton
                                priceId={plan.id}
                                customerEmail={user?.email || undefined}
                                buttonText={
                                  isPatient 
                                    ? `Comenzar Prueba Gratuita de ${plan.trial_days} Días`
                                    : isCurrentlySubscribed 
                                    ? `Cambiar a ${plan.name} ($${formatPriceLocal(plan.amount)}/mes)`
                                    : `Suscribirse por $${formatPriceLocal(plan.amount)}/mes`
                                }
                                className={`w-full font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                                  plan.popular
                                    ? 'bg-gradient-to-r from-coral to-coral/90 hover:from-coral/90 hover:to-coral text-white'
                                    : 'bg-gradient-to-r from-sage-green to-sage-green/90 hover:from-sage-green/90 hover:to-sage-green text-white'
                                }`}
                                metadata={{
                                  plan_name: plan.name,
                                  user_type: user?.role || 'patient',
                                  source: 'dashboard_billing',
                                  ...(isPatient && plan.trial_days && { trial_days: plan.trial_days.toString() })
                                }}
                                onSuccess={handleSubscriptionSuccess}
                                onError={(error) => {
                                  console.error('Subscription error:', error);
                                  alert(`Error al iniciar suscripción: ${error}`);
                                }}
                              />
                            )}
                          </div>

                          {/* Trust badges */}
                          <div className="flex items-center justify-center gap-4 pt-4 border-t text-xs text-charcoal/60">
                            <div className="flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              <span>Pagos seguros</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              <span>Cancela cuando quieras</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CreditCard className="w-3 h-3" />
                              <span>Sin cargos ocultos</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info */}
            <Alert className="bg-blue-50 border-blue-200">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <div className="space-y-2">
                  <p><strong>¿Necesitas ayuda?</strong> Contáctanos en cualquier momento para asistencia personalizada.</p>
                  <p className="text-sm">
                    Tu suscripción se gestiona de forma segura através de Stripe. 
                    Puedes actualizar tu información de pago o cancelar desde el portal de gestión.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </FadeIn>
      </PageTransition>
    </DashboardLayout>
  );
} 