import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Simulating Stripe webhook event...')
    
    const adminSupabase = createAdminClient()
    
    // Simular un evento de customer.subscription.created
    const mockSubscriptionEvent = {
      id: `sub_mock_webhook_${Date.now()}`,
      customer: `cus_mock_webhook_${Date.now()}`,
      status: 'trialing',
      items: {
        data: [
          {
            price: {
              id: 'price_1RVDer4E1fMQUCHe1bi3YujU' // Patient plan
            }
          }
        ]
      },
      metadata: {
        user_id: '03c33d4e-e753-4504-ab29-31bf7d0ea3c5', // joaco@gmail.com
        user_type: 'patient',
        user_email: 'joaco@gmail.com',
        source: 'simulated_webhook'
      },
      current_period_start: Math.floor(Date.now() / 1000),
      current_period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000), // +30 days
      trial_start: Math.floor(Date.now() / 1000),
      trial_end: Math.floor((Date.now() + 15 * 24 * 60 * 60 * 1000) / 1000), // +15 days
      cancel_at_period_end: false,
      canceled_at: null
    }

    console.log('📝 Processing simulated subscription:', {
      subscriptionId: mockSubscriptionEvent.id,
      userId: mockSubscriptionEvent.metadata.user_id,
      userType: mockSubscriptionEvent.metadata.user_type,
      priceId: mockSubscriptionEvent.items.data[0].price.id
    })

    // Crear suscripción en la base de datos (igual que el webhook real)
    const subscriptionData = {
      user_id: mockSubscriptionEvent.metadata.user_id,
      user_type: mockSubscriptionEvent.metadata.user_type,
      stripe_customer_id: mockSubscriptionEvent.customer,
      stripe_subscription_id: mockSubscriptionEvent.id,
      status: mockSubscriptionEvent.status,
      price_id: mockSubscriptionEvent.items.data[0].price.id,
      current_period_start: new Date(mockSubscriptionEvent.current_period_start * 1000).toISOString(),
      current_period_end: new Date(mockSubscriptionEvent.current_period_end * 1000).toISOString(),
      trial_start: new Date(mockSubscriptionEvent.trial_start * 1000).toISOString(),
      trial_end: new Date(mockSubscriptionEvent.trial_end * 1000).toISOString(),
      cancel_at_period_end: mockSubscriptionEvent.cancel_at_period_end,
      canceled_at: null,
    }

    console.log('💾 Inserting subscription data:', subscriptionData)

    const { data: subscription, error: subError } = await adminSupabase
      .from('subscriptions')
      .upsert(subscriptionData, { onConflict: 'stripe_subscription_id' })
      .select()
      .single()

    if (subError) {
      console.error('❌ Subscription error:', subError)
      throw new Error(`Subscription insert failed: ${subError.message}`)
    }

    console.log('✅ Subscription created via webhook simulation')

    // Crear trial para paciente
    const trialData = {
      user_id: mockSubscriptionEvent.metadata.user_id,
      trial_start: new Date(mockSubscriptionEvent.trial_start * 1000).toISOString(),
      trial_end: new Date(mockSubscriptionEvent.trial_end * 1000).toISOString(),
      trial_used: true,
      stripe_subscription_id: mockSubscriptionEvent.id,
    }

    console.log('💾 Inserting trial data:', trialData)

    const { data: trial, error: trialError } = await adminSupabase
      .from('patient_trials')
      .upsert(trialData, { onConflict: 'user_id' })
      .select()
      .single()

    if (trialError) {
      console.error('❌ Trial error:', trialError)
      // No throw, trial is optional
    } else {
      console.log('✅ Trial created via webhook simulation')
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook simulation completed successfully',
      subscription: subscription,
      trial: trial || null,
      webhook_event: {
        type: 'customer.subscription.created',
        subscription_id: mockSubscriptionEvent.id,
        user_id: mockSubscriptionEvent.metadata.user_id,
        user_type: mockSubscriptionEvent.metadata.user_type
      }
    })

  } catch (error) {
    console.error('❌ Webhook simulation error:', error)
    return NextResponse.json(
      { 
        error: 'Webhook simulation failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
} 