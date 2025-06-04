import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get user from query parameter
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 })
    }

    // Get auth user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    // Try to get user from auth.users by email (this might not work due to RLS)
    // Instead, let's get the authenticated user and check if emails match
    
    // Check if we have tables
    const { data: tablesCheck } = await supabase
      .from('subscriptions')
      .select('count')
      .limit(1)

    const { data: profilesCheck } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    // Get current authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    
    // If we have an authenticated user, get their data
    let userData = null
    let subscriptions = []
    let trials = []
    let profiles = []
    
    if (user) {
      // Get subscriptions for this user
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)

      subscriptions = subData || []

      // Get patient trials for this user
      const { data: trialData, error: trialError } = await supabase
        .from('patient_trials')
        .select('*')
        .eq('user_id', user.id)

      trials = trialData || []

      // Get profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)

      profiles = profileData || []

      userData = {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        role: user.user_metadata?.role || 'unknown'
      }
    }

    // Get all prices
    const { data: prices, error: priceError } = await supabase
      .from('prices')
      .select('*')

    return NextResponse.json({
      success: true,
      request_email: email,
      authenticated_user: userData,
      has_auth_user: !!user,
      email_matches: user?.email === email,
      subscriptions: subscriptions,
      trials: trials,
      profiles: profiles,
      prices: prices || [],
      table_checks: {
        subscriptions_accessible: !!tablesCheck,
        profiles_accessible: !!profilesCheck
      }
    })

  } catch (error) {
    console.error('❌ Debug error:', error)
    return NextResponse.json(
      { 
        error: 'Debug failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
} 