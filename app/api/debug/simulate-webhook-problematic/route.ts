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

export async function POST(req: NextRequest) {
  try {
    console.log('🧪 Simulating webhook for problematic user...')
    
    // Use the problematic user ID that was failing
    const problematicUserId = '36771a78-dbbf-4a1a-8adf-07be7a95a276'
    
    // Create a mock subscription object similar to what Stripe sends
    const mockSubscription = {
      id: `sub_test_${Date.now()}`,
      customer: `cus_test_${Date.now()}`,
      status: 'trialing',
      current_period_start: Math.floor(Date.now() / 1000),
      current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
      trial_start: Math.floor(Date.now() / 1000),
      trial_end: Math.floor(Date.now() / 1000) + (15 * 24 * 60 * 60), // 15 days trial
      cancel_at_period_end: false,
      canceled_at: null,
      metadata: {
        user_id: problematicUserId,
        user_type: 'patient'
      },
      items: {
        data: [{
          price: {
            id: 'price_1RVDer4E1fMQUCHe1bi3YujU' // Patient plan price
          }
        }]
      }
    }

    console.log('📝 Mock subscription data:', {
      id: mockSubscription.id,
      customer: mockSubscription.customer,
      status: mockSubscription.status,
      metadata: mockSubscription.metadata,
      priceId: mockSubscription.items.data[0].price.id
    })

    // Process the webhook data exactly like the real webhook does
    const userId = mockSubscription.metadata?.user_id
    const userType = mockSubscription.metadata?.user_type || 'patient'
    const priceId = mockSubscription.items?.data?.[0]?.price?.id

    console.log('Extracted data:', { userId, userType, priceId })

    if (userId && priceId) {
      // Test the new robust user validation
      const { data: userProfiles, error: userCheckError } = await supabaseServiceRole
        .from('profiles')
        .select('id, user_id')
        .eq('user_id', userId)

      if (userCheckError) {
        console.error('❌ Database query error:', userCheckError.message)
        return Response.json({ 
          error: 'Database query failed', 
          details: userCheckError.message 
        }, { status: 500 })
      }

      if (!userProfiles || userProfiles.length === 0) {
        console.error('❌ User profile not found:', { userId })
        return Response.json({ 
          error: 'User validation failed', 
          details: `User ${userId} not found in profiles database`
        }, { status: 400 })
      }

      if (userProfiles.length > 1) {
        console.warn('⚠️ Multiple profiles found for user:', { userId, count: userProfiles.length })
      }

      const userProfile = userProfiles[0]
      console.log('✅ User profile validated:', { 
        authUserId: userId, 
        profileId: userProfile.id,
        profileCount: userProfiles.length 
      })

      console.log('✅ Creating subscription in database')

      // Insert subscription
      const subscriptionData = {
        user_id: userId,
        user_type: userType,
        stripe_customer_id: mockSubscription.customer,
        stripe_subscription_id: mockSubscription.id,
        status: mockSubscription.status,
        price_id: priceId,
        current_period_start: new Date(mockSubscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(mockSubscription.current_period_end * 1000).toISOString(),
        trial_start: new Date(mockSubscription.trial_start * 1000).toISOString(),
        trial_end: new Date(mockSubscription.trial_end * 1000).toISOString(),
        cancel_at_period_end: false,
        canceled_at: null,
      }

      console.log('📝 Subscription data to insert:', subscriptionData)

      const { error } = await supabaseServiceRole
        .from('subscriptions')
        .upsert(subscriptionData, { onConflict: 'stripe_subscription_id' })

      if (error) {
        console.error('❌ Database error:', error)
        return Response.json({ error: 'Database error', details: error.message }, { status: 500 })
      }

      console.log('✅ Subscription created successfully')

      // Create trial record
      if (userType === 'patient' && mockSubscription.trial_end) {
        console.log('🎯 Creating trial record for patient')
        
        const { error: trialError } = await supabaseServiceRole
          .from('patient_trials')
          .upsert({
            user_id: userId,
            trial_start: new Date(mockSubscription.trial_start * 1000).toISOString(),
            trial_end: new Date(mockSubscription.trial_end * 1000).toISOString(),
            trial_used: true,
            stripe_subscription_id: mockSubscription.id,
          }, { onConflict: 'user_id' })

        if (trialError) {
          console.warn('⚠️ Trial creation failed:', trialError)
        } else {
          console.log('✅ Patient trial created successfully')
        }
      }

      return Response.json({ 
        success: true,
        message: 'Webhook simulation successful for problematic user',
        userId,
        subscriptionId: mockSubscription.id,
        userProfile: userProfile
      })

    } else {
      console.error('❌ Missing required data:', { userId, priceId })
      return Response.json({ error: 'Missing required webhook data' }, { status: 400 })
    }
    
  } catch (error) {
    console.error('🚨 Webhook simulation failed:', error)
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined 
    }, { status: 500 })
  }
} 