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
    console.log('🧪 Testing database operations for webhook...')
    
    // Test 1: Try to insert a test subscription
    const testSubscriptionData = {
      user_id: 'test-user-id-12345', // Fake user ID for testing
      user_type: 'patient',
      stripe_customer_id: 'cus_test_12345',
      stripe_subscription_id: 'sub_test_12345_' + Date.now(),
      status: 'trialing',
      price_id: 'price_1RVDer4E1fMQUCHe1bi3YujU',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      trial_start: new Date().toISOString(),
      trial_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      cancel_at_period_end: false,
      canceled_at: null,
    }
    
    console.log('📝 Testing subscription insert with data:', testSubscriptionData)
    
    const { data: subResult, error: subError } = await supabaseServiceRole
      .from('subscriptions')
      .upsert(testSubscriptionData, { onConflict: 'stripe_subscription_id' })
      .select()
    
    console.log('Subscription insert result:', { 
      success: !subError, 
      error: subError?.message,
      details: subError?.details,
      hint: subError?.hint,
      code: subError?.code
    })
    
    // Test 2: Try to insert a test trial
    const testTrialData = {
      user_id: 'test-user-id-12345',
      trial_start: new Date().toISOString(),
      trial_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      trial_used: true,
      stripe_subscription_id: testSubscriptionData.stripe_subscription_id,
    }
    
    console.log('📝 Testing trial insert with data:', testTrialData)
    
    const { data: trialResult, error: trialError } = await supabaseServiceRole
      .from('patient_trials')
      .upsert(testTrialData, { onConflict: 'user_id' })
      .select()
    
    console.log('Trial insert result:', { 
      success: !trialError, 
      error: trialError?.message,
      details: trialError?.details,
      hint: trialError?.hint,
      code: trialError?.code
    })
    
    // Cleanup test data
    if (!subError) {
      await supabaseServiceRole
        .from('subscriptions')
        .delete()
        .eq('stripe_subscription_id', testSubscriptionData.stripe_subscription_id)
    }
    
    if (!trialError) {
      await supabaseServiceRole
        .from('patient_trials')
        .delete()
        .eq('user_id', 'test-user-id-12345')
    }
    
    return Response.json({
      subscriptionTest: {
        success: !subError,
        error: subError?.message,
        details: subError?.details,
        hint: subError?.hint,
        code: subError?.code,
        data: subResult
      },
      trialTest: {
        success: !trialError,
        error: trialError?.message,
        details: trialError?.details,
        hint: trialError?.hint,
        code: trialError?.code,
        data: trialResult
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('🚨 Database test failed:', error)
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined 
    }, { status: 500 })
  }
} 