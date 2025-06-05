import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Checking auth users vs profiles...')
    
    // Check auth.users table
    const { data: authUsers, error: authError } = await supabaseServiceRole
      .from('auth.users')
      .select('id, email, created_at')
      .limit(5)
    
    console.log('Auth users result:', { success: !authError, error: authError?.message })
    
    // Check if the existing subscription user exists in auth.users
    const existingUserId = '03c33d4e-e753-4504-ab29-31bf7d0ea3c5'
    const { data: existingUser, error: existingError } = await supabaseServiceRole
      .from('auth.users')
      .select('id, email')
      .eq('id', existingUserId)
      .single()
    
    console.log('Existing user check:', { 
      success: !existingError, 
      error: existingError?.message,
      user: existingUser 
    })
    
    return Response.json({
      authUsers: {
        success: !authError,
        error: authError?.message,
        data: authUsers
      },
      existingUserCheck: {
        success: !existingError,
        error: existingError?.message,
        user: existingUser,
        userId: existingUserId
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('🚨 Auth check failed:', error)
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined 
    }, { status: 500 })
  }
} 