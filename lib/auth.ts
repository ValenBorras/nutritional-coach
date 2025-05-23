import { createClient } from './supabase/server'
import { Database } from './database.types'

export type User = Database['public']['Tables']['users']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']

export async function getUser(): Promise<{ user: User | null; profile: Profile | null }> {
  const supabase = await createClient()
  
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !authUser) {
    return { user: null, profile: null }
  }

  // Get user data from our custom users table
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (userError || !user) {
    return { user: null, profile: null }
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', authUser.id)
    .single()

  return { 
    user, 
    profile: profileError ? null : profile 
  }
}

export async function requireAuth() {
  const { user } = await getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  return user
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}

export async function createUserProfile(userId: string, userData: Partial<User>, profileData?: Partial<Profile>) {
  const supabase = await createClient()
  
  // Create/update user record
  const { data: user, error: userError } = await supabase
    .from('users')
    .upsert({ id: userId, ...userData })
    .select()
    .single()

  if (userError) {
    throw new Error(`Failed to create user: ${userError.message}`)
  }

  // Create profile if data provided
  if (profileData) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({ user_id: userId, ...profileData })
      .select()
      .single()

    if (profileError) {
      throw new Error(`Failed to create profile: ${profileError.message}`)
    }

    return { user, profile }
  }

  return { user, profile: null }
} 