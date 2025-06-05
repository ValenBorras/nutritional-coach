'use client'

import { useSubscriptionStatus } from '@/hooks/use-subscription-status'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/app/components/ui/button'
import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { Clock, Star, CheckCircle, AlertTriangle, Gift } from 'lucide-react'
import { motion } from 'framer-motion'

export function TrialBanner() {
  const { user } = useAuth()
  const { hasActiveSubscription, hasActiveTrial, trialDaysRemaining, loading, error } = useSubscriptionStatus()

  // Solo mostrar para usuarios autenticados que son pacientes
  if (!user || user.role !== 'patient' || loading) {
    return null
  }

  // No mostrar si hay error
  if (error) {
    console.warn('TrialBanner error:', error)
    return null
  }

  // No mostrar si ya tiene suscripción activa
  if (hasActiveSubscription) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-lg mb-6"
      >
        <div className="flex items-center justify-center gap-3">
          <CheckCircle className="h-5 w-5" />
          <div className="text-center">
            <h3 className="font-semibold">
              ¡Suscripción Activa!
            </h3>
            <p className="text-sm opacity-90">
              Tienes acceso completo a todas las funciones
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  // Mostrar banner de trial activo
  if (hasActiveTrial && trialDaysRemaining > 0) {
    const isUrgent = trialDaysRemaining <= 3
    
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-white p-4 rounded-lg mb-6 ${
          isUrgent 
            ? 'bg-gradient-to-r from-orange-500 to-red-600' 
            : 'bg-gradient-to-r from-blue-500 to-purple-600'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isUrgent ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <Clock className="h-5 w-5" />
            )}
            <div>
              <h3 className="font-semibold">
                {isUrgent ? '¡Trial terminando pronto!' : '¡Trial gratuito activo!'}
              </h3>
              <p className="text-sm opacity-90">
                Te quedan {trialDaysRemaining} día{trialDaysRemaining !== 1 ? 's' : ''} gratis
              </p>
            </div>
          </div>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => window.location.href = '/dashboard/billing'}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <Star className="h-4 w-4 mr-2" />
            {isUrgent ? 'Suscribirse Ahora' : 'Ver Planes'}
          </Button>
        </div>
      </motion.div>
    )
  }

  // Trial expirado - mostrar banner de suscripción
  if (!hasActiveTrial || trialDaysRemaining <= 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-coral to-coral/90 text-white p-4 rounded-lg mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gift className="h-5 w-5" />
            <div>
              <h3 className="font-semibold">
                Tu trial ha expirado
              </h3>
              <p className="text-sm opacity-90">
                Suscríbete para continuar usando NutriGuide
              </p>
            </div>
          </div>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => window.location.href = '/dashboard/billing'}
            className="bg-white text-coral hover:bg-white/90"
          >
            <Star className="h-4 w-4 mr-2" />
            Ver Planes
          </Button>
        </div>
      </motion.div>
    )
  }

  return null
} 