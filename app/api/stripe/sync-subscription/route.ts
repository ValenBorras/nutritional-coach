import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/config'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function normalizeStatus(status: string): string {
  const s = (status || '').toLowerCase()
  const allowed = new Set([
    'active', 'trialing', 'past_due', 'canceled', 'inactive',
    'incomplete', 'incomplete_expired', 'unpaid', 'paused'
  ])
  if (allowed.has(s)) return s
  if (s === 'incomplete' || s === 'incomplete_expired' || s === 'paused') return 'inactive'
  if (s === 'unpaid') return 'past_due'
  return 'inactive'
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (!user || authError) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Try to find existing customer_id from our DB first
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    let customerId = existingSub?.stripe_customer_id as string | undefined

    if (!customerId) {
      // Look up Stripe customer by email
      const customers = await stripe.customers.list({ email: user.email || undefined, limit: 1 })
      customerId = customers.data[0]?.id
    }

    if (!customerId) {
      return NextResponse.json({ message: 'No Stripe customer found for this user' }, { status: 200 })
    }

    // Get latest subscription for this customer
    const subs = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 1 })
    const sub = subs.data[0]

    if (!sub) {
      return NextResponse.json({ message: 'No Stripe subscriptions found for this customer' }, { status: 200 })
    }

    const admin = createAdminClient()

    const priceId = sub.items?.data?.[0]?.price?.id
    const userType = (sub.metadata?.user_type as string) || 'patient'

    const item = (sub as any)?.items?.data?.[0]
    const periodStartUnix: number | null = (((sub as any).current_period_start) ?? item?.current_period_start) ?? null
    const periodEndUnix: number | null = (((sub as any).current_period_end) ?? item?.current_period_end) ?? null

    const { error } = await admin
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        user_type: userType,
        stripe_customer_id: sub.customer as string,
        stripe_subscription_id: sub.id,
        status: normalizeStatus(sub.status as string),
        price_id: priceId,
        current_period_start: periodStartUnix ? new Date(periodStartUnix * 1000).toISOString() : null,
        current_period_end: periodEndUnix ? new Date(periodEndUnix * 1000).toISOString() : null,
        trial_start: sub.trial_start ? new Date((sub.trial_start as number) * 1000).toISOString() : null,
        trial_end: sub.trial_end ? new Date((sub.trial_end as number) * 1000).toISOString() : null,
        cancel_at_period_end: Boolean(sub.cancel_at_period_end),
        canceled_at: normalizeStatus(sub.status as string) === 'canceled' ? new Date().toISOString() : null,
      }, { onConflict: 'stripe_subscription_id' })

    if (error) {
      return NextResponse.json({ error: 'Failed to upsert subscription', details: error.message }, { status: 500 })
    }

    // If patient with trial
    if (userType === 'patient' && sub.trial_end) {
      await admin
        .from('patient_trials')
        .upsert({
          user_id: user.id,
          trial_start: new Date((sub.trial_start as number) * 1000).toISOString(),
          trial_end: new Date((sub.trial_end as number) * 1000).toISOString(),
          trial_used: true,
          stripe_subscription_id: sub.id,
        }, { onConflict: 'user_id' })
    }

    return NextResponse.json({ success: true, synced: true, stripe_subscription_id: sub.id })

  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}


