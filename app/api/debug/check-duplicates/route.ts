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
    console.log('🔍 Checking for duplicate user_id entries...')
    
    // Find duplicate user_ids
    const { data: duplicateQuery, error: duplicateError } = await supabaseServiceRole
      .from('profiles')
      .select('user_id')
      .then(async (result) => {
        if (result.error) return result
        
        // Group by user_id and count
        const userCounts: Record<string, number> = {}
        result.data.forEach(profile => {
          userCounts[profile.user_id] = (userCounts[profile.user_id] || 0) + 1
        })
        
        const duplicates = Object.entries(userCounts)
          .filter(([userId, count]) => count > 1)
          .map(([userId, count]) => ({ user_id: userId, count }))
        
        return { data: duplicates, error: null }
      })
    
    // Get specific user details for problematic user
    const problematicUserId = '36771a78-dbbf-4a1a-8adf-07be7a95a276'
    const { data: problematicUserProfiles, error: problematicError } = await supabaseServiceRole
      .from('profiles')
      .select('*')
      .eq('user_id', problematicUserId)
    
    // Test the exact webhook query that's failing
    const { data: webhookQueryResult, error: webhookQueryError } = await supabaseServiceRole
      .from('profiles')
      .select('id, user_id')
      .eq('user_id', problematicUserId)
      .single() // This is what's failing
    
    return Response.json({
      duplicateCheck: {
        success: !duplicateError,
        duplicates: duplicateQuery || [],
        error: duplicateError?.message
      },
      problematicUser: {
        userId: problematicUserId,
        profiles: problematicUserProfiles,
        count: problematicUserProfiles?.length || 0,
        error: problematicError?.message
      },
      webhookQuery: {
        success: !webhookQueryError,
        result: webhookQueryResult,
        error: webhookQueryError?.message,
        explanation: 'This is the exact query that fails in the webhook'
      },
      recommendation: 'If there are duplicates, we need to clean them up or change the webhook query to handle multiple rows.',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('🚨 Duplicate check failed:', error)
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined 
    }, { status: 500 })
  }
} 