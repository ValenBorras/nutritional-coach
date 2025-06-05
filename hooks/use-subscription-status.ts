'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'

interface SubscriptionStatus {
  hasActiveSubscription: boolean
  hasActiveTrial: boolean
  trialDaysRemaining: number
  loading: boolean
  error: string | null
}

export function useSubscriptionStatus(): SubscriptionStatus {
  const { user } = useAuth()
  const [status, setStatus] = useState<SubscriptionStatus>({
    hasActiveSubscription: false,
    hasActiveTrial: false,
    trialDaysRemaining: 0,
    loading: true,
    error: null
  })

  useEffect(() => {
    async function fetchSubscriptionStatus() {
      if (!user?.id) {
        setStatus({
          hasActiveSubscription: false,
          hasActiveTrial: false,
          trialDaysRemaining: 0,
          loading: false,
          error: null
        })
        return
      }

      try {
        const supabase = createClient()
        
        // Llamar a las funciones SQL que creamos
        const [subscriptionResult, trialResult, daysResult] = await Promise.all([
          supabase.rpc('has_active_subscription', { user_id_param: user.id }),
          supabase.rpc('has_active_trial', { user_id_param: user.id }),
          supabase.rpc('trial_days_remaining', { user_id_param: user.id })
        ])

        if (subscriptionResult.error) {
          throw new Error(`Subscription check failed: ${subscriptionResult.error.message}`)
        }

        if (trialResult.error) {
          throw new Error(`Trial check failed: ${trialResult.error.message}`)
        }

        if (daysResult.error) {
          throw new Error(`Days remaining check failed: ${daysResult.error.message}`)
        }

        setStatus({
          hasActiveSubscription: subscriptionResult.data || false,
          hasActiveTrial: trialResult.data || false,
          trialDaysRemaining: daysResult.data || 0,
          loading: false,
          error: null
        })

      } catch (error) {
        console.error('Error fetching subscription status:', error)
        setStatus({
          hasActiveSubscription: false,
          hasActiveTrial: false,
          trialDaysRemaining: 0,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    fetchSubscriptionStatus()
  }, [user?.id])

  return status
} 