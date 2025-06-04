"use client";

import { useState } from "react";
import DashboardLayout from "@/app/components/dashboard-layout";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from "@/app/components/ui/page-transition";
import { useSubscription } from "@/hooks/use-subscription";
import { useAuth } from "@/hooks/use-auth";
import { AvailablePlans } from "@/app/components/available-plans";
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
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

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
  const [showAvailablePlans, setShowAvailablePlans] = useState(false);

  const handleOpenCustomerPortal = async () => {
    try {
      setPortalLoading(true);
      await createCustomerPortalSession();
    } catch (error) {
      console.error("Error opening customer portal:", error);
      // You could add a toast notification here
    } finally {
      setPortalLoading(false);
    }
  };

  const handlePlanSelect = () => {
    // Refresh subscription data after plan change
    refetch();
    setShowAvailablePlans(false);
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-marcellus text-charcoal">
                  Facturación
                </h1>
                <p className="text-charcoal/70 mt-2">
                  Gestiona tu suscripción y métodos de pago
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

            <StaggerContainer staggerChildren={0.1}>
              {/* Trial Banner for Patients */}
              {user?.role === "patient" && isTrialActive && (
                <StaggerItem>
                  <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                    <Alert className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 mb-8">
                      <Gift className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <strong>¡Período de prueba activo!</strong>
                            <br />
                            Te quedan {trialDaysRemaining} días gratis para explorar todas las funciones.
                          </div>
                          <Button variant="outline" size="sm" className="ml-4">
                            <Link href="/pricing">Ver Planes</Link>
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                </StaggerItem>
              )}

              {/* Subscription Status */}
              <StaggerItem>
                <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }} className="mb-8">
                  <Card className="shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-coral" />
                        Estado de la Suscripción
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
                              {formatPrice(price.unit_amount, price.currency)}
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
                </motion.div>
              </StaggerItem>

              {/* Plan Information */}
              <StaggerItem>
                <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }} className="mb-8">
                  <Card className="shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <CardTitle>Información del Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {subscription && price ? (
                        <div className="space-y-4">
                          {/* Current Plan Info */}
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-charcoal/70">Tipo de Usuario:</span>
                              <Badge variant="outline">
                                {user?.role === "nutritionist" ? "Nutricionista" : "Paciente"}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-charcoal/70">Plan:</span>
                              <span className="font-medium">
                                {price.metadata?.name || `Plan ${price.user_type}`}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-charcoal/70">Facturación:</span>
                              <span className="font-medium">
                                {price.interval === "month" ? "Mensual" : "Anual"}
                              </span>
                            </div>
                            {price.trial_period_days && (
                              <div className="flex justify-between items-center">
                                <span className="text-charcoal/70">Período de prueba:</span>
                                <span className="font-medium">{price.trial_period_days} días</span>
                              </div>
                            )}
                          </div>

                          {/* Available Plans Toggle */}
                          <div className="border-t pt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowAvailablePlans(!showAvailablePlans)}
                              className="w-full border-coral/30 text-coral hover:bg-coral/10"
                            >
                              {showAvailablePlans ? (
                                <>
                                  <ChevronUp className="w-4 h-4 mr-2" />
                                  Ocultar Planes Disponibles
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4 mr-2" />
                                  Ver Planes Disponibles
                                </>
                              )}
                            </Button>

                            <AnimatePresence>
                              {showAvailablePlans && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="mt-4"
                                >
                                  <AvailablePlans 
                                    currentPriceId={price.id}
                                    onPlanSelect={handlePlanSelect}
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      ) : isTrialActive ? (
                        <div className="space-y-4">
                          {/* Trial Info */}
                          <div className="text-center py-4">
                            <Gift className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                            <p className="text-charcoal font-medium">
                              Disfrutando del período de prueba gratuito
                            </p>
                            <p className="text-charcoal/60 text-sm">
                              {trialDaysRemaining} días restantes
                            </p>
                          </div>

                          {/* Available Plans for Trial Users */}
                          <div className="border-t pt-4">
                            <div className="text-center mb-4">
                              <p className="text-sm text-charcoal/70 mb-2">
                                ¿Listo para continuar? Elige tu plan:
                              </p>
                            </div>
                            <AvailablePlans onPlanSelect={handlePlanSelect} />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* No Subscription */}
                          <div className="text-center py-4 text-charcoal/60">
                            <p className="mb-4">No tienes una suscripción activa</p>
                          </div>

                          {/* Available Plans for Non-subscribers */}
                          <div className="border-t pt-4">
                            <div className="text-center mb-4">
                              <p className="text-sm text-charcoal/70 mb-2">
                                Planes disponibles para ti:
                              </p>
                            </div>
                            <AvailablePlans onPlanSelect={handlePlanSelect} />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </StaggerItem>

              {/* Payment Methods & History */}
              {subscription && (
                <StaggerItem>
                  <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }} className="mb-8">
                    <Card className="shadow-lg hover:shadow-xl transition-shadow">
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
                            onClick={handleOpenCustomerPortal}
                            disabled={portalLoading}
                            variant="outline"
                            className="border-coral text-coral hover:bg-coral hover:text-white"
                          >
                            {portalLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Cargando...
                              </>
                            ) : (
                              <>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Abrir Portal de Pagos
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </StaggerItem>
              )}

              {/* Help & Support */}
              <StaggerItem>
                <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                  <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-blue-900">
                        ¿Necesitas ayuda?
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-blue-800">
                        <p className="text-sm">
                          Si tienes alguna pregunta sobre tu facturación o necesitas cambiar tu plan, 
                          no dudes en contactarnos.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                            Contactar Soporte
                          </Button>
                          <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                            Preguntas Frecuentes
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </FadeIn>
      </PageTransition>
    </DashboardLayout>
  );
} 