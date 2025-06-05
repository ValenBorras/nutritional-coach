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
    console.log('🔍 Checking profile structure...')
    
    // Get all columns from profiles table
    const { data: profiles, error: profilesError } = await supabaseServiceRole
      .from('profiles')
      .select('*')
      .limit(5)
    
    console.log('Profiles result:', { success: !profilesError, error: profilesError?.message })
    
    // Check the working subscription user_id
    const workingUserId = '03c33d4e-e753-4504-ab29-31bf7d0ea3c5'
    
    // Check if this ID exists in profiles as id
    const { data: profileById, error: profileByIdError } = await supabaseServiceRole
      .from('profiles')
      .select('*')
      .eq('id', workingUserId)
      .single()
    
    // Check if this ID exists in profiles as user_id
    const { data: profileByUserId, error: profileByUserIdError } = await supabaseServiceRole
      .from('profiles')
      .select('*')
      .eq('user_id', workingUserId)
      .single()
    
    console.log('Working ID checks:', {
      byId: { success: !profileByIdError, error: profileByIdError?.message },
      byUserId: { success: !profileByUserIdError, error: profileByUserIdError?.message }
    })
    
    return Response.json({
      profilesSample: {
        success: !profilesError,
        error: profilesError?.message,
        data: profiles
      },
      workingIdAnalysis: {
        workingUserId,
        foundAsProfileId: {
          success: !profileByIdError,
          error: profileByIdError?.message,
          data: profileById
        },
        foundAsProfileUserId: {
          success: !profileByUserIdError,
          error: profileByUserIdError?.message,
          data: profileByUserId
        }
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('🚨 Profile structure check failed:', error)
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined 
    }, { status: 500 })
  }
} 