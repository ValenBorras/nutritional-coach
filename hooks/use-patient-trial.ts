import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/use-user'

interface TrialInfo {
  hasTrail: boolean
  isActive: boolean
  daysRemaining: number
  trialEnd: string | null
  hasSubscription: boolean
}

export function usePatientTrial() {
  const { user } = useUser()
  const [trialInfo, setTrialInfo] = useState<TrialInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTrialInfo() {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const supabase = createClient()
        
        // Llamar a la función de la base de datos
        const { data, error: functionError } = await supabase
          .rpc('get_patient_trial_status', { patient_id: user.id })

        if (functionError) {
          console.error('Error fetching trial info:', functionError)
          setError(functionError.message)
          setIsLoading(false)
          return
        }

        if (data && data.length > 0) {
          const trial = data[0]
          setTrialInfo({
            hasTrail: trial.has_trial,
            isActive: trial.is_active,
            daysRemaining: trial.days_remaining,
            trialEnd: trial.trial_end,
            hasSubscription: trial.has_subscription,
          })
        } else {
          // No hay trial registrado
          setTrialInfo({
            hasTrail: false,
            isActive: false,
            daysRemaining: 0,
            trialEnd: null,
            hasSubscription: false,
          })
        }
      } catch (err) {
        console.error('Error in usePatientTrial:', err)
        setError('Failed to fetch trial information')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrialInfo()
  }, [user])

  // Helper para determinar si el paciente necesita suscripción
  const needsSubscription = trialInfo ? 
    !trialInfo.isActive && !trialInfo.hasSubscription : 
    false

  // Helper para determinar si el trial está por vencer (3 días o menos)
  const trialEndingSoon = trialInfo ? 
    trialInfo.isActive && trialInfo.daysRemaining <= 3 : 
    false

  return {
    trialInfo,
    isLoading,
    error,
    needsSubscription,
    trialEndingSoon,
  }
} 