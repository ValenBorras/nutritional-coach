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
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId') || '36771a78-dbbf-4a1a-8adf-07be7a95a276' // Default to problematic user
    
    console.log(`🔍 Checking user: ${userId}`)
    
    // Check if user exists in profiles table
    const { data: profiles, error: profilesError } = await supabaseServiceRole
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
    
    // Also check if user ID exists as profile ID
    const { data: profilesById, error: profilesByIdError } = await supabaseServiceRole
      .from('profiles')
      .select('*')
      .eq('id', userId)
    
    // Check existing subscriptions for this user
    const { data: subscriptions, error: subsError } = await supabaseServiceRole
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
    
    // Check all users to see the pattern
    const { data: allProfiles, error: allProfilesError } = await supabaseServiceRole
      .from('profiles')
      .select('id, user_id, email, user_type')
      .limit(10)

    return Response.json({
      searchUserId: userId,
      profilesByUserId: {
        success: !profilesError,
        count: profiles?.length || 0,
        data: profiles,
        error: profilesError?.message
      },
      profilesById: {
        success: !profilesByIdError,
        count: profilesById?.length || 0,
        data: profilesById,
        error: profilesByIdError?.message
      },
      subscriptions: {
        success: !subsError,
        count: subscriptions?.length || 0,
        data: subscriptions,
        error: subsError?.message
      },
      allProfiles: {
        success: !allProfilesError,
        count: allProfiles?.length || 0,
        data: allProfiles,
        error: allProfilesError?.message
      },
      recommendation: userId === '36771a78-dbbf-4a1a-8adf-07be7a95a276' 
        ? 'This appears to be a test user that does not exist in the database. The webhook should gracefully handle this by returning a 400 error (which it is doing correctly).'
        : 'Check if this is a valid user that should exist in the database.',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('🚨 User check failed:', error)
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined 
    }, { status: 500 })
  }
} 