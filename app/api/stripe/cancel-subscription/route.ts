import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe/config'

export async function POST(_req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    // Get current subscription
    const { data: sub, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (subError) return NextResponse.json({ error: subError.message }, { status: 500 })
    if (!sub?.stripe_subscription_id) return NextResponse.json({ error: 'Sin suscripción activa' }, { status: 404 })

    // Cancel at period end in Stripe
    const canceled = await stripe.subscriptions.update(sub.stripe_subscription_id, {
      cancel_at_period_end: true,
    })

    // Mirror to Supabase
    const admin = createAdminClient()
    const { error: upsertError } = await admin.from('subscriptions').upsert({
      user_id: user.id,
      user_type: sub.user_type,
      stripe_customer_id: canceled.customer as string,
      stripe_subscription_id: canceled.id,
      status: canceled.status,
      price_id: canceled.items?.data?.[0]?.price?.id,
      current_period_start: new Date((canceled.current_period_start as number) * 1000).toISOString(),
      current_period_end: new Date((canceled.current_period_end as number) * 1000).toISOString(),
      trial_start: canceled.trial_start ? new Date((canceled.trial_start as number) * 1000).toISOString() : null,
      trial_end: canceled.trial_end ? new Date((canceled.trial_end as number) * 1000).toISOString() : null,
      cancel_at_period_end: Boolean(canceled.cancel_at_period_end),
      canceled_at: null,
    }, { onConflict: 'stripe_subscription_id' })

    if (upsertError) return NextResponse.json({ error: upsertError.message }, { status: 500 })

    return NextResponse.json({ success: true, stripe_status: canceled.status })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}


