import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Checking current authenticated user...')
    
    const supabase = await createClient()
    
    // Get current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('Auth user result:', { 
      success: !authError, 
      error: authError?.message,
      userId: user?.id,
      email: user?.email 
    })

    if (!user) {
      return Response.json({
        authenticated: false,
        error: 'No authenticated user',
        authError: authError?.message
      })
    }

    // Check if user has profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    console.log('Profile check:', { 
      success: !profileError, 
      error: profileError?.message,
      hasProfile: !!profile 
    })

    return Response.json({
      authenticated: true,
      authUser: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at
      },
      profile: {
        exists: !!profile,
        error: profileError?.message,
        data: profile
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('🚨 Current user check failed:', error)
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined 
    }, { status: 500 })
  }
} 