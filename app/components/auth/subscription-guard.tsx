'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useSubscriptionStatus } from '@/hooks/use-subscription-status'
import { LoadingCard } from '@/app/components/ui/loading-spinner'
import { Card } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { AlertTriangle, Gift } from 'lucide-react'

interface SubscriptionGuardProps {
  children: React.ReactNode
}

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const {
    hasActiveSubscription,
    hasActiveTrial,
    trialDaysRemaining,
    loading: statusLoading,
    error,
  } = useSubscriptionStatus()

  if (authLoading || statusLoading) {
    return <LoadingCard />
  }

  // If any unexpected error while checking status, allow rendering to avoid hard lock
  if (error) {
    return <>{children}</>
  }

  // Gate everyone who is NOT a nutritionist (patients o usuarios sin rol explícito)
  const isNutritionist = user?.role === 'nutritionist'
  const hasAccess = Boolean(hasActiveSubscription || hasActiveTrial)

  if (!isNutritionist && !hasAccess) {
    // Fullscreen blocking overlay
    return (
      <div className="relative">
        {/* Underlying content can be present but interaction is blocked by overlay */}
        <div className="pointer-events-none opacity-30">
          {children}
        </div>

        <div className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <AlertTriangle className="w-7 h-7 text-red-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-charcoal">
                  Tu acceso ha expirado
                </h2>
                <p className="text-sm text-charcoal/70 mt-1">
                  Necesitas una suscripción activa para seguir usando tu cuenta. Todos los pacientes tienen 15 días de prueba gratis.
                </p>
                <div className="flex flex-wrap gap-3 mt-5">
                  <Button className="bg-coral hover:bg-coral/90" onClick={() => router.push('/dashboard/billing')}>
                    Suscribirme ahora
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/pricing')}>
                    Ver planes
                  </Button>
                  <Button variant="ghost" onClick={() => router.push('/login')}>
                    Cerrar sesión
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // If on trial, optionally show a subtle reminder (non-blocking) for non-nutritionists
  if (!isNutritionist && hasActiveTrial && !hasActiveSubscription && trialDaysRemaining <= 3) {
    return (
      <div className="space-y-4">
        <Card className="p-4 border-amber-200 bg-amber-50">
          <div className="flex items-center gap-3 text-amber-800">
            <Gift className="w-5 h-5" />
            <p className="text-sm">
              Tu prueba gratuita termina en {trialDaysRemaining} {trialDaysRemaining === 1 ? 'día' : 'días'}. Suscríbete para no perder acceso.
            </p>
            <Button size="sm" className="ml-auto bg-coral hover:bg-coral/90" onClick={() => router.push('/dashboard/billing')}>
              Suscribirme
            </Button>
          </div>
        </Card>
        {children}
      </div>
    )
  }

  return <>{children}</>
}


