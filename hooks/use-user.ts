import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  email: string
  user_type: 'nutritionist' | 'patient'
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

interface UseUserReturn {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  error: string | null
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function getUser() {
      try {
        // Obtener usuario actual
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          setError(userError.message)
          setIsLoading(false)
          return
        }

        setUser(currentUser)

        // Si hay usuario, obtener su perfil
        if (currentUser) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single()

          if (profileError) {
            setError(profileError.message)
          } else {
            setProfile(profileData)
          }
        }
      } catch (err) {
        setError('Error fetching user data')
        console.error('Error in useUser:', err)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()

    // Escuchar cambios en el estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          setUser(session.user)
          
          // Obtener perfil actualizado
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          setProfile(profileData)
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    user,
    profile,
    isLoading,
    error
  }
} 