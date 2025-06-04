import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe/config'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')!

    if (!signature) {
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
      console.error('Webhook signature verification failed:', error)
      return Response.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    console.log(`Processing webhook: ${event.type}`)

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object, supabase)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object, supabase)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object, supabase)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object, supabase)
        break

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object, supabase)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object, supabase)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object, supabase)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return Response.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return Response.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// Manejar checkout completado
async function handleCheckoutCompleted(session: any, supabase: any) {
  console.log('Processing checkout.session.completed')
  
  const userId = session.metadata?.user_id
  const userType = session.metadata?.user_type
  
  if (!userId || !userType) {
    console.error('Missing user metadata in checkout session')
    return
  }

  // Si es un paciente y tiene trial, registrar el trial
  if (userType === 'patient' && session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(session.subscription)
    
    if (subscription.trial_end) {
      const { error } = await supabase.from('patient_trials').upsert({
        user_id: userId,
        trial_start: new Date(subscription.trial_start! * 1000).toISOString(),
        trial_end: new Date(subscription.trial_end * 1000).toISOString(),
        stripe_subscription_id: subscription.id,
        trial_used: true,
      })

      if (error) {
        console.error('Error creating patient trial:', error)
      }
    }
  }
}

// Manejar creación de suscripción
async function handleSubscriptionCreated(subscription: any, supabase: any) {
  console.log('Processing customer.subscription.created')
  
  const userId = subscription.metadata?.user_id
  const userType = subscription.metadata?.user_type
  const priceId = subscription.metadata?.price_id

  if (!userId || !userType || !priceId) {
    console.error('Missing metadata in subscription')
    return
  }

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
    cancel_at_period_end: subscription.cancel_at_period_end,
    canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
  }

  const { error } = await supabase
    .from('subscriptions')
    .upsert(subscriptionData, { onConflict: 'stripe_subscription_id' })

  if (error) {
    console.error('Error creating subscription:', error)
  }
}

// Manejar actualización de suscripción
async function handleSubscriptionUpdated(subscription: any, supabase: any) {
  console.log('Processing customer.subscription.updated')
  
  const updateData = {
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
    trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    cancel_at_period_end: subscription.cancel_at_period_end,
    canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('subscriptions')
    .update(updateData)
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Error updating subscription:', error)
  }
}

// Manejar eliminación de suscripción
async function handleSubscriptionDeleted(subscription: any, supabase: any) {
  console.log('Processing customer.subscription.deleted')
  
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Error deleting subscription:', error)
  }
}

// Manejar trial que va a terminar
async function handleTrialWillEnd(subscription: any, supabase: any) {
  console.log('Processing customer.subscription.trial_will_end')
  
  // Obtener información del usuario
  const { data: subData } = await supabase
    .from('subscriptions')
    .select('user_id, user_type')
    .eq('stripe_subscription_id', subscription.id)
    .single()

  if (subData?.user_type === 'patient') {
    // Aquí puedes enviar emails/notificaciones sobre el fin del trial
    console.log(`Trial ending for patient: ${subData.user_id}`)
    // TODO: Implementar notificaciones por email/push
  }
}

// Manejar pago exitoso
async function handlePaymentSucceeded(invoice: any, supabase: any) {
  console.log('Processing invoice.payment_succeeded')
  
  if (invoice.subscription) {
    // Actualizar estado de suscripción si es necesario
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', invoice.subscription)

    if (error) {
      console.error('Error updating subscription after payment:', error)
    }
  }
}

// Manejar pago fallido
async function handlePaymentFailed(invoice: any, supabase: any) {
  console.log('Processing invoice.payment_failed')
  
  if (invoice.subscription) {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', invoice.subscription)

    if (error) {
      console.error('Error updating subscription after failed payment:', error)
    }
  }
} 