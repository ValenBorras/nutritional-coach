import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { userId, priceId, userType } = await request.json()
    
    if (!userId || !priceId || !userType) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, priceId, userType' 
      }, { status: 400 })
    }

    console.log('🔄 Creating mock subscription for:', { userId, priceId, userType })

    // Use admin client for all operations to bypass RLS
    const adminSupabase = createAdminClient()
    
    // First, let's check if this user already has a subscription
    const { data: existingSub } = await adminSupabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (existingSub) {
      return NextResponse.json({
        success: false,
        message: 'User already has a subscription',
        existing_subscription: existingSub
      })
    }
    
    // Create a mock subscription
    const mockSubscription = {
      user_id: userId,
      user_type: userType,
      stripe_customer_id: `cus_mock_${Date.now()}`,
      stripe_subscription_id: `sub_mock_${Date.now()}`,
      status: 'active',
      price_id: priceId,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
      trial_start: userType === 'patient' ? new Date().toISOString() : null,
      trial_end: userType === 'patient' ? new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() : null, // +15 days for patients
      cancel_at_period_end: false,
      canceled_at: null,
    }

    console.log('📝 Mock subscription data:', mockSubscription)

    const { data, error } = await adminSupabase
      .from('subscriptions')
      .insert(mockSubscription)
      .select()
      .single()

    if (error) {
      console.error('❌ Subscription insert error:', error)
      throw new Error(`Subscription insert failed: ${error.message} (${error.code})`)
    }

    console.log('✅ Mock subscription created:', data)

    // For patients with trial, also create trial record
    if (userType === 'patient') {
      const trialData = {
        user_id: userId,
        trial_start: new Date().toISOString(),
        trial_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        trial_used: true,
      }

      console.log('📝 Creating trial data:', trialData)

      const { error: trialError } = await adminSupabase
        .from('patient_trials')
        .insert(trialData)

      if (trialError) {
        console.error('❌ Trial insert error:', trialError)
      } else {
        console.log('✅ Trial created successfully')
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Mock subscription created successfully',
      subscription: data
    })

  } catch (error) {
    console.error('❌ Error creating mock subscription:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create mock subscription', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
} 