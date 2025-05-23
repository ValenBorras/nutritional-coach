import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User as AuthUser } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types'

type User = Database['public']['Tables']['users']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthState {
  user: User | null
  profile: Profile | null
  authUser: AuthUser | null
  loading: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    authUser: null,
    loading: true
  })

  const supabase = createClient()

  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        await loadUserData(session.user)
      } else {
        setAuthState({
          user: null,
          profile: null,
          authUser: null,
          loading: false
        })
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await loadUserData(session.user)
        } else {
          setAuthState({
            user: null,
            profile: null,
            authUser: null,
            loading: false
          })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function loadUserData(authUser: AuthUser) {
    try {
      // Get user data from our custom users table
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (userError) {
        console.error('Error loading user:', userError)
        setAuthState({
          user: null,
          profile: null,
          authUser,
          loading: false
        })
        return
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single()

      setAuthState({
        user,
        profile: profileError ? null : profile,
        authUser,
        loading: false
      })
    } catch (error) {
      console.error('Error loading user data:', error)
      setAuthState({
        user: null,
        profile: null,
        authUser,
        loading: false
      })
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  async function signUpWithEmail(email: string, password: string, metadata?: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return { data, error }
  }

  return {
    ...authState,
    signOut,
    signInWithEmail,
    signUpWithEmail,
    supabase
  }
} 