import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/config'
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
    const url = new URL(req.url)
    const secretFromQuery = url.searchParams.get('secret')
    const secretFromHeader = req.headers.get('x-sync-secret')
    const expected = process.env.SYNC_ALL_SECRET

    // In development, allow running without secret for ease of local ops
    const isDev = process.env.NODE_ENV !== 'production'
    if (!isDev) {
      if (!expected || (secretFromQuery !== expected && secretFromHeader !== expected)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const admin = createAdminClient()

    // Get all app users with email
    const { data: users, error: usersError } = await admin
      .from('users')
      .select('id, email')
      .not('email', 'is', null)

    if (usersError) {
      return NextResponse.json({ error: 'Failed to fetch users', details: usersError.message }, { status: 500 })
    }

    const results: Array<{ userId: string, email: string | null, synced: number, message?: string }> = []

    for (const u of users || []) {
      const email = u.email as string | null
      if (!email) {
        results.push({ userId: u.id, email: null, synced: 0, message: 'No email' })
        continue
      }

      // Find Stripe customer by email
      const customers = await stripe.customers.list({ email, limit: 1 })
      const customer = customers.data[0]
      if (!customer) {
        results.push({ userId: u.id, email, synced: 0, message: 'No Stripe customer' })
        continue
      }

      // List all subscriptions for this customer
      const subs = await stripe.subscriptions.list({ customer: customer.id, status: 'all', limit: 100 })
      if (subs.data.length === 0) {
        results.push({ userId: u.id, email, synced: 0, message: 'No subscriptions' })
        continue
      }

      let syncedCount = 0

      for (const sub of subs.data) {
        const item = (sub as any)?.items?.data?.[0]
        const priceId: string | undefined = item?.price?.id

        // Determine user_type using prices table when possible
        let userType: 'patient' | 'nutritionist' = 'patient'
        if (priceId) {
          const { data: priceRow } = await admin
            .from('prices')
            .select('user_type')
            .eq('id', priceId)
            .maybeSingle()
          if (priceRow?.user_type === 'nutritionist') userType = 'nutritionist'
        }

        const periodStartUnix: number | null = (((sub as any).current_period_start) ?? item?.current_period_start) ?? null
        const periodEndUnix: number | null = (((sub as any).current_period_end) ?? item?.current_period_end) ?? null

        const { error: upsertError } = await admin
          .from('subscriptions')
          .upsert({
            user_id: u.id,
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

        if (!upsertError) {
          syncedCount += 1
        }

        if (userType === 'patient' && sub.trial_end) {
          await admin
            .from('patient_trials')
            .upsert({
              user_id: u.id,
              trial_start: new Date((sub.trial_start as number) * 1000).toISOString(),
              trial_end: new Date((sub.trial_end as number) * 1000).toISOString(),
              trial_used: true,
              stripe_subscription_id: sub.id,
            }, { onConflict: 'user_id' })
        }
      }

      results.push({ userId: u.id, email, synced: syncedCount })
    }

    const totalUsers = users?.length || 0
    const totalSubscriptions = results.reduce((acc, r) => acc + r.synced, 0)

    return NextResponse.json({
      success: true,
      totalUsers,
      totalSubscriptionsSynced: totalSubscriptions,
      results,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}


