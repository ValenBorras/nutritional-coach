"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent } from "@/app/components/ui/card";
import { CheckoutModal } from "@/app/components/checkout-modal";
import { usePlans } from "@/hooks/use-plans";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, CheckCircle, Star, Zap } from "lucide-react";

interface AvailablePlansProps {
  currentPriceId?: string;
  onPlanSelect?: (priceId: string) => void;
}

export function AvailablePlans({ currentPriceId, onPlanSelect }: AvailablePlansProps) {
  const { user } = useAuth();
  const { plans, loading, error, formatPrice } = usePlans();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleUpgrade = async (plan: any) => {
    setSelectedPlan(plan);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSuccess = () => {
    onPlanSelect?.(selectedPlan?.id);
    setIsCheckoutOpen(false);
    setSelectedPlan(null);
  };

  const handleCheckoutClose = () => {
    setIsCheckoutOpen(false);
    setSelectedPlan(null);
  };

  const getPlanIcon = (plan: any) => {
    if (plan.metadata?.popular) {
      return <Star className="w-4 h-4 text-yellow-500" />;
    }
    if (plan.unit_amount === 0) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <Zap className="w-4 h-4 text-blue-500" />;
  };

  const getPlanName = (plan: any) => {
    if (plan.metadata?.name) return plan.metadata.name;
    
    // Default names based on user type and price
    if (user?.role === "nutritionist") {
      if (plan.unit_amount === 0) return "Plan Gratuito";
      if (plan.unit_amount <= 3000) return "Plan Profesional";
      if (plan.unit_amount <= 10000) return "Plan Clínica";
      return "Plan Enterprise";
    } else {
      if (plan.unit_amount === 0) return "Prueba Gratuita";
      return "Plan Mensual";
    }
  };

  const getPlanDescription = (plan: any) => {
    if (plan.metadata?.description) return plan.metadata.description;
    
    // Default descriptions
    if (user?.role === "nutritionist") {
      if (plan.unit_amount === 0) return "Hasta 5 pacientes";
      if (plan.unit_amount <= 3000) return "Pacientes ilimitados + IA avanzada";
      if (plan.unit_amount <= 10000) return "Múltiples nutricionistas + Dashboard";
      return "Integración completa + Soporte dedicado";
    } else {
      if (plan.unit_amount === 0) return "15 días gratis";
      return "Acceso completo + Chat IA personalizado";
    }
  };

  const isCurrentPlan = (priceId: string) => {
    return currentPriceId === priceId;
  };

  const getButtonText = (plan: any) => {
    if (isCurrentPlan(plan.id)) {
      return "Plan Actual";
    }
    
    if (plan.unit_amount === 0) {
      return "Plan Gratuito";
    }
    
    if (!currentPriceId) {
      return "Suscribirse";
    }
    
    return "Cambiar Plan";
  };

  const getButtonVariant = (plan: any) => {
    if (isCurrentPlan(plan.id)) {
      return "outline" as const;
    }
    
    if (plan.metadata?.popular) {
      return "default" as const;
    }
    
    return "outline" as const;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-coral" />
        <span className="ml-2 text-sm text-charcoal/70">Cargando planes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-red-600">Error al cargar los planes: {error}</p>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-charcoal/70">No hay planes disponibles en este momento.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <div className="text-sm font-medium text-charcoal mb-3">
          {user?.role === "nutritionist" ? "Planes para Nutricionistas" : "Planes para Pacientes"}
        </div>
        
        {plans.map((plan) => (
          <Card key={plan.id} className={`transition-all duration-200 ${
            plan.metadata?.popular 
              ? "ring-2 ring-coral/20 border-coral/30" 
              : "border-gray-200 hover:border-coral/30"
          } ${isCurrentPlan(plan.id) ? "bg-green-50 border-green-300" : ""}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex items-center space-x-2">
                    {getPlanIcon(plan)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-charcoal">
                          {getPlanName(plan)}
                        </h4>
                        {plan.metadata?.popular && (
                          <Badge className="bg-coral text-white text-xs">
                            Popular
                          </Badge>
                        )}
                        {isCurrentPlan(plan.id) && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            Actual
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-charcoal/70 mt-1">
                        {getPlanDescription(plan)}
                      </p>
                      {plan.trial_period_days && (
                        <p className="text-xs text-blue-600 mt-1">
                          🎁 {plan.trial_period_days} días de prueba gratis
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    {plan.unit_amount > 0 ? (
                      <>
                        <div className="font-bold text-charcoal">
                          {formatPrice(plan.unit_amount, plan.currency)}
                        </div>
                        <div className="text-xs text-charcoal/60">
                          por {plan.interval === "month" ? "mes" : "año"}
                        </div>
                      </>
                    ) : (
                      <div className="font-bold text-green-600">
                        Gratis
                      </div>
                    )}
                  </div>
                  
                  <Button
                    size="sm"
                    variant={getButtonVariant(plan)}
                    disabled={isCurrentPlan(plan.id) || plan.unit_amount === 0}
                    onClick={() => handleUpgrade(plan)}
                    className={
                      plan.metadata?.popular && !isCurrentPlan(plan.id)
                        ? "bg-coral hover:bg-coral/90 text-white"
                        : ""
                    }
                  >
                    {getButtonText(plan)}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <div className="text-xs text-charcoal/60 mt-3 p-3 bg-blue-50 rounded-lg">
          💡 <strong>Tip:</strong> Puedes cambiar o cancelar tu plan en cualquier momento desde aquí o desde el portal de pagos.
        </div>
      </div>

      {/* Checkout Modal */}
      {selectedPlan && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={handleCheckoutClose}
          priceId={selectedPlan.id}
          planName={getPlanName(selectedPlan)}
          amount={selectedPlan.unit_amount}
          currency={selectedPlan.currency}
          interval={selectedPlan.interval}
          trialDays={selectedPlan.trial_period_days}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </>
  );
} 