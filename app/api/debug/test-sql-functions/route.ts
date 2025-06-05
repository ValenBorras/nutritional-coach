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
    console.log('🧪 Testing SQL functions...')
    
    // Use the authenticated user ID from the terminal logs
    const testUserId = '22ff060b-c711-489f-bc33-e605d1ec6a95' // serena@gmail.com
    
    // Test all three SQL functions
    const [subscriptionResult, trialResult, daysResult] = await Promise.all([
      supabaseServiceRole.rpc('has_active_subscription', { user_id_param: testUserId }),
      supabaseServiceRole.rpc('has_active_trial', { user_id_param: testUserId }),
      supabaseServiceRole.rpc('trial_days_remaining', { user_id_param: testUserId })
    ])

    console.log('SQL Functions Results:', {
      subscription: { success: !subscriptionResult.error, data: subscriptionResult.data, error: subscriptionResult.error?.message },
      trial: { success: !trialResult.error, data: trialResult.data, error: trialResult.error?.message },
      days: { success: !daysResult.error, data: daysResult.data, error: daysResult.error?.message }
    })

    // Also check the actual database state
    const { data: subscriptions, error: subError } = await supabaseServiceRole
      .from('subscriptions')
      .select('*')
      .eq('user_id', testUserId)

    const { data: trials, error: trialError } = await supabaseServiceRole
      .from('patient_trials')
      .select('*')
      .eq('user_id', testUserId)

    return Response.json({
      testUserId,
      sqlFunctions: {
        hasActiveSubscription: {
          success: !subscriptionResult.error,
          data: subscriptionResult.data,
          error: subscriptionResult.error?.message
        },
        hasActiveTrial: {
          success: !trialResult.error,
          data: trialResult.data,
          error: trialResult.error?.message
        },
        trialDaysRemaining: {
          success: !daysResult.error,
          data: daysResult.data,
          error: daysResult.error?.message
        }
      },
      databaseState: {
        subscriptions: {
          success: !subError,
          count: subscriptions?.length || 0,
          data: subscriptions,
          error: subError?.message
        },
        trials: {
          success: !trialError,
          count: trials?.length || 0,
          data: trials,
          error: trialError?.message
        }
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('🚨 SQL functions test failed:', error)
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined 
    }, { status: 500 })
  }
} 