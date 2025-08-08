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

    // Helper: persist subscription to Supabase
    function normalizeStatus(status: string): string {
      const s = (status || '').toLowerCase()
      const allowed = new Set([
        'active', 'trialing', 'past_due', 'canceled', 'inactive',
        'incomplete', 'incomplete_expired', 'unpaid', 'paused'
      ])
      if (allowed.has(s)) return s
      // Map uncommon statuses to closest supported ones if DB has strict CHECK
      if (s === 'incomplete' || s === 'incomplete_expired' || s === 'paused') return 'inactive'
      if (s === 'unpaid') return 'past_due'
      return 'inactive'
    }
    async function upsertSubscriptionFromStripe(sub: any) {
      const userId = sub.metadata?.user_id
      const userType = (sub.metadata?.user_type as string) || 'patient'
      const priceId = sub.items?.data?.[0]?.price?.id

      // Period dates: API 2025 may not include top-level current_period_start/end
      const item = sub.items?.data?.[0]
      const periodStartUnix: number | null = (sub.current_period_start ?? item?.current_period_start) ?? null
      const periodEndUnix: number | null = (sub.current_period_end ?? item?.current_period_end) ?? null

      if (!userId || !priceId) {
        console.error('❌ Missing required subscription metadata', { userId, priceId, metadata: sub.metadata })
        return { ok: false, reason: 'missing_metadata' as const }
      }

      const { error } = await supabaseServiceRole
        .from('subscriptions')
        .upsert({
          user_id: userId,
          user_type: userType,
          stripe_customer_id: sub.customer,
          stripe_subscription_id: sub.id,
          status: normalizeStatus(sub.status),
          price_id: priceId,
          current_period_start: periodStartUnix ? new Date(periodStartUnix * 1000).toISOString() : null,
          current_period_end: periodEndUnix ? new Date(periodEndUnix * 1000).toISOString() : null,
          trial_start: sub.trial_start ? new Date((sub.trial_start as number) * 1000).toISOString() : null,
          trial_end: sub.trial_end ? new Date((sub.trial_end as number) * 1000).toISOString() : null,
          cancel_at_period_end: Boolean(sub.cancel_at_period_end),
          canceled_at: normalizeStatus(sub.status) === 'canceled' ? new Date().toISOString() : null,
        }, { onConflict: 'stripe_subscription_id' })

      if (error) {
        console.error('❌ Upsert subscription failed:', error)
        return { ok: false, reason: 'db_error' as const }
      }

      // Create/update patient trial record if applicable
      if ((userType === 'patient') && sub.trial_end) {
        const { error: trialError } = await supabaseServiceRole
          .from('patient_trials')
          .upsert({
            user_id: userId,
            trial_start: new Date(sub.trial_start! * 1000).toISOString(),
            trial_end: new Date(sub.trial_end * 1000).toISOString(),
            trial_used: true,
            stripe_subscription_id: sub.id,
          }, { onConflict: 'user_id' })

        if (trialError) {
          console.warn('⚠️ Upsert trial failed (non-blocking):', trialError)
        }
      }

      console.log('✅ Subscription persisted for user', userId)
      return { ok: true as const }
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        // Retrieve the full subscription to get metadata
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          await upsertSubscriptionFromStripe(subscription)
        }
        break
      }
      case 'customer.subscription.created': {
        const subscription = event.data.object as any
        await upsertSubscriptionFromStripe(subscription)
        break
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any
        await upsertSubscriptionFromStripe(subscription)
        break
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        await upsertSubscriptionFromStripe({ ...subscription, status: 'canceled' })
        break
      }
      default: {
        console.log(`ℹ️ Ignoring webhook type: ${event.type}`)
      }
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