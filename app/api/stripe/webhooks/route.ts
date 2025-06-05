import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe/config'
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
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')!

    if (!signature) {
      console.warn('⚠️ Webhook attempt without signature')
      return Response.json({ error: 'No signature found' }, { status: 400 })
    }

    let event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (error) {
      console.error('🚨 Invalid webhook signature:', error)
      return Response.json({ error: 'Webhook signature verification failed' }, { status: 400 })
    }

    console.log(`✅ Verified webhook: ${event.type}`)

    // Handle only subscription created for now
    if (event.type === 'customer.subscription.created') {
      const subscription = event.data.object as any // Cast to any to bypass TS strict checking
      console.log('Processing subscription created:', {
        id: subscription.id,
        status: subscription.status,
        customer: subscription.customer,
        metadata: subscription.metadata,
        items: subscription.items?.data?.length || 0
      })

      // Extract basic data
      const userId = subscription.metadata?.user_id
      const userType = subscription.metadata?.user_type || 'patient'
      const priceId = subscription.items?.data?.[0]?.price?.id

      console.log('Webhook data:', { userId, userType, priceId })

      if (userId && priceId) {
        try {
          // Validate that user exists before creating subscription
          const { data: userExists, error: userCheckError } = await supabaseServiceRole
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .single()

          if (userCheckError || !userExists) {
            console.error('❌ User not found in database:', { userId, error: userCheckError?.message })
            return Response.json({ 
              error: 'User validation failed', 
              details: `User ${userId} not found in database`,
              userCheckError: userCheckError?.message 
            }, { status: 400 })
          }

          console.log('✅ User validated:', userId)

          // Simple subscription insert
          const { error } = await supabaseServiceRole
            .from('subscriptions')
            .upsert({
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
              canceled_at: null,
            }, { onConflict: 'stripe_subscription_id' })

          if (error) {
            console.error('❌ Database error:', error)
            return Response.json({ error: 'Database error', details: error.message }, { status: 500 })
          }

          console.log('✅ Subscription created in database')

          // Create trial if needed
          if (userType === 'patient' && subscription.trial_end) {
            const { error: trialError } = await supabaseServiceRole
              .from('patient_trials')
              .upsert({
                user_id: userId,
                trial_start: new Date(subscription.trial_start! * 1000).toISOString(),
                trial_end: new Date(subscription.trial_end * 1000).toISOString(),
                trial_used: true,
                stripe_subscription_id: subscription.id,
              }, { onConflict: 'user_id' })

            if (trialError) {
              console.warn('⚠️ Trial creation failed:', trialError)
              // Don't fail webhook for trial error
            } else {
              console.log('✅ Trial created')
            }
          }

        } catch (dbError) {
          console.error('💥 Database operation failed:', dbError)
          return Response.json({ error: 'Database operation failed' }, { status: 500 })
        }
      } else {
        console.error('❌ Missing required data:', { userId, priceId })
        return Response.json({ error: 'Missing required webhook data' }, { status: 400 })
      }
    } else {
      console.log(`Ignoring webhook type: ${event.type}`)
    }

    return Response.json({ received: true })

  } catch (error) {
    console.error('💥 Webhook handler failed:', error)
    return Response.json(
      { 
        error: 'Webhook handler failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
} 