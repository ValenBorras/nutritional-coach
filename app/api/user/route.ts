import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    // Get user data from custom users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    
    if (userError) {
      console.error('Error loading user:', userError)
      return NextResponse.json(
        { 
          error: 'User not found',
          details: userError.message,
          code: userError.code
        },
        { status: 404 }
      )
    }
    
    // Get profile data (optional)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    // Profile error is not critical
    if (profileError && profileError.code !== 'PGRST116') {
      console.warn('Profile error (non-critical):', profileError)
    }
    
    return NextResponse.json({
      success: true,
      user,
      profile: profileError ? null : profile
    })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 