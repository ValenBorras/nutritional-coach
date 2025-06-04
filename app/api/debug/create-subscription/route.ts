import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Creating test subscription...')
    
    const adminSupabase = createAdminClient()
    
    // Use hardcoded data from the recent session
    const subscriptionData = {
      user_id: '03c33d4e-e753-4504-ab29-31bf7d0ea3c5', // joaco@gmail.com
      user_type: 'patient',
      stripe_customer_id: `cus_test_${Date.now()}`,
      stripe_subscription_id: `sub_test_${Date.now()}`,
      status: 'trialing', // Start with trial status
      price_id: 'price_1RVDer4E1fMQUCHe1bi3YujU',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
      trial_start: new Date().toISOString(),
      trial_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // +15 days
      cancel_at_period_end: false,
      canceled_at: null,
    }

    console.log('📝 Inserting subscription:', subscriptionData)

    const { data: subscription, error: subError } = await adminSupabase
      .from('subscriptions')
      .insert(subscriptionData)
      .select()
      .single()

    if (subError) {
      console.error('❌ Subscription error:', subError)
      throw new Error(`Subscription insert failed: ${subError.message}`)
    }

    console.log('✅ Subscription created:', subscription)

    // Create patient trial record
    const trialData = {
      user_id: '03c33d4e-e753-4504-ab29-31bf7d0ea3c5',
      trial_start: new Date().toISOString(),
      trial_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      trial_used: true,
    }

    console.log('📝 Inserting trial:', trialData)

    const { data: trial, error: trialError } = await adminSupabase
      .from('patient_trials')
      .insert(trialData)
      .select()
      .single()

    if (trialError) {
      console.error('❌ Trial error:', trialError)
      // Don't throw, trial is optional
    } else {
      console.log('✅ Trial created:', trial)
    }

    return NextResponse.json({
      success: true,
      message: 'Test subscription and trial created successfully',
      subscription,
      trial: trial || null
    })

  } catch (error) {
    console.error('❌ Error creating test subscription:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create test subscription', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
} 