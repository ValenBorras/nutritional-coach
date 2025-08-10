'use client'

import { useSubscriptionStatus } from '@/hooks/use-subscription-status'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Crown,
  Gift,
  Zap
} from 'lucide-react'

export function SubscriptionStatusCard() {
  const { user } = useAuth()
  const { hasActiveSubscription, hasActiveTrial, trialDaysRemaining, loading, error } = useSubscriptionStatus()

  if (!user || loading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-400 animate-pulse" />
            Cargando estado...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="shadow-lg border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Error al cargar estado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  const getStatusInfo = () => {
    if (hasActiveSubscription) {
      return {
        icon: <Crown className="w-5 h-5 text-green-500" />,
        title: 'Suscripción Activa',
        status: 'Activo',
        description: 'Tienes acceso completo a todas las funciones de NutriGuide',
        badgeColor: 'bg-green-100 text-green-800',
        cardClass: 'border-green-200 bg-green-50'
      }
    }

    if (hasActiveTrial && trialDaysRemaining > 0) {
      const isUrgent = trialDaysRemaining <= 3
      return {
        icon: isUrgent ? <AlertTriangle className="w-5 h-5 text-orange-500" /> : <Gift className="w-5 h-5 text-blue-500" />,
        title: 'Trial Activo',
        status: `${trialDaysRemaining} día${trialDaysRemaining !== 1 ? 's' : ''} restante${trialDaysRemaining !== 1 ? 's' : ''}`,
        description: isUrgent 
          ? 'Tu trial termina pronto. ¡Suscríbete para no perder el acceso!'
          : 'Estás probando todas las funciones premium de forma gratuita',
        badgeColor: isUrgent ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800',
        cardClass: isUrgent ? 'border-orange-200 bg-orange-50' : 'border-blue-200 bg-blue-50'
      }
    }

    return {
      icon: <XCircle className="w-5 h-5 text-gray-400" />,
      title: 'Sin Suscripción',
      status: 'Trial Expirado',
      description: 'Suscríbete para continuar disfrutando de NutriGuide',
      badgeColor: 'bg-gray-100 text-gray-800',
      cardClass: 'border-gray-200 bg-gray-50'
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <Card className={`shadow-lg ${statusInfo.cardClass}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-coral" />
          Estado de tu Suscripción
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {statusInfo.icon}
            <div>
              <p className="font-medium text-charcoal">
                {statusInfo.title}
              </p>
              <Badge className={statusInfo.badgeColor}>
                {statusInfo.status}
              </Badge>
            </div>
          </div>
          
          {hasActiveSubscription && (
            <div className="text-right">
              <p className="text-lg font-bold text-charcoal flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Premium
              </p>
            </div>
          )}
        </div>

        <p className="text-sm text-charcoal/70">
          {statusInfo.description}
        </p>

        {/* Acciones según el estado */}
        {!hasActiveSubscription && (
          <div className="pt-2 border-t">
            <Button
              onClick={() => window.location.href = '/dashboard/billing'}
              className="w-full bg-coral hover:bg-coral/90 text-white"
            >
              <Zap className="w-4 h-4 mr-2" />
              {hasActiveTrial ? 'Ver Planes de Suscripción' : 'Comenzar Suscripción'}
            </Button>
          </div>
        )}

        {/* Mostrar funciones disponibles */}
        <div className="pt-2 border-t">
          <p className="text-xs font-medium text-charcoal/60 mb-2">
            {hasActiveSubscription || hasActiveTrial ? 'Funciones Disponibles:' : 'Con la suscripción tendrás:'}
          </p>
          <div className="grid grid-cols-2 gap-1 text-xs text-charcoal/60">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              Chat IA ilimitado
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              Planes personalizados
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              Seguimiento avanzado
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              Soporte prioritario
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 