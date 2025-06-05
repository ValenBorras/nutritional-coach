import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role client for webhooks
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

export async function POST(req: NextRequest) {
  try {
    console.log('🧪 Simulating webhook customer.subscription.created')
    
    // Simulate the exact data structure from Stripe webhook
    const mockSubscription = {
      id: 'sub_test_' + Date.now(),
      customer: 'cus_test_' + Date.now(),
      status: 'trialing',
      current_period_start: Math.floor(Date.now() / 1000),
      current_period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
      trial_start: Math.floor(Date.now() / 1000),
      trial_end: Math.floor((Date.now() + 15 * 24 * 60 * 60 * 1000) / 1000),
      cancel_at_period_end: false,
      canceled_at: null,
      metadata: {
        user_id: 'user_test_id_from_request', // We'll get this from request
        user_type: 'patient'
      },
      items: {
        data: [
          {
            price: {
              id: 'price_1RVDer4E1fMQUCHe1bi3YujU'
            }
          }
        ]
      }
    }

    const { user_id } = await req.json()
    
    if (!user_id) {
      return Response.json({ error: 'user_id required in body' }, { status: 400 })
    }

    // Update mock data with real user ID
    mockSubscription.metadata.user_id = user_id

    console.log('📝 Mock subscription data:', mockSubscription)

    // Call the same handler as the real webhook
    await handleSubscriptionCreated(mockSubscription, supabaseServiceRole)

    return Response.json({ 
      success: true, 
      message: 'Webhook simulation completed',
      mockSubscription 
    })

  } catch (error) {
    console.error('🚨 Webhook simulation failed:', error)
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined 
    }, { status: 500 })
  }
}

// Copy the exact handler from webhook
async function handleSubscriptionCreated(subscription: any, supabase: any) {
  try {
    console.log('Processing customer.subscription.created', {
      subscriptionId: subscription.id,
      metadata: subscription.metadata,
      hasItems: !!subscription.items?.data?.length
    })
    
    const userId = subscription.metadata?.user_id
    const userType = subscription.metadata?.user_type || 'patient'
    const priceId = subscription.items?.data?.[0]?.price?.id

    console.log('Extracted data:', { userId, userType, priceId })

    if (!userId) {
      console.error('❌ Missing user_id in subscription metadata')
      throw new Error('Missing user_id in subscription metadata')
    }

    if (!priceId) {
      console.error('❌ Missing price_id in subscription items')
      throw new Error('Missing price_id in subscription items')
    }

    console.log('✅ Creating subscription in database')

    const subscriptionData = {
      user_id: userId,
      user_type: userType,
      stripe_customer_id: subscription.customer,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      price_id: priceId,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
    }

    console.log('📝 Subscription data to insert:', subscriptionData)

    const { data, error } = await supabase
      .from('subscriptions')
      .upsert(subscriptionData, { onConflict: 'stripe_subscription_id' })

    if (error) {
      console.error('❌ Database error creating subscription:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log('✅ Subscription created successfully')

    // For patients with trials, also create trial record
    if (userType === 'patient' && subscription.trial_end) {
      console.log('🎯 Creating trial record for patient')
      
      const trialData = {
        user_id: userId,
        trial_start: new Date(subscription.trial_start! * 1000).toISOString(),
        trial_end: new Date(subscription.trial_end * 1000).toISOString(),
        trial_used: true,
        stripe_subscription_id: subscription.id,
      }

      const { error: trialError } = await supabase.from('patient_trials').upsert(trialData, {
        onConflict: 'user_id'
      })

      if (trialError) {
        console.error('❌ Error creating patient trial:', trialError)
      } else {
        console.log('✅ Patient trial created successfully')
      }
    }

  } catch (error) {
    console.error('💥 Error in handleSubscriptionCreated:', error)
    throw error
  }
} 