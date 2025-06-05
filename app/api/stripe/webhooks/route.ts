import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe/config'
import { createClient } from '@supabase/supabase-js'

// Create a service role client specifically for webhooks with limited permissions
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
  // 🔒 SECURITY LOGGING
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  const userAgent = req.headers.get('user-agent') || 'unknown'
  const timestamp = new Date().toISOString()
  
  console.log(`🔐 Webhook access attempt:`, {
    timestamp,
    ip: clientIP,
    userAgent,
    hasSignature: !!req.headers.get('stripe-signature')
  })

  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')!

    if (!signature) {
      console.warn(`⚠️ Webhook attempt without signature from IP: ${clientIP}`)
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
      console.error(`🚨 Invalid webhook signature from IP: ${clientIP}`, error)
      return Response.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    console.log(`✅ Verified webhook: ${event.type} from IP: ${clientIP}`)

    // Use service role client with verified webhook context
    const supabase = supabaseServiceRole

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
    console.error('💥 Webhook error:', error)
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

// Security validation helpers
function validateUserId(userId: string): boolean {
  // UUID v4 format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(userId);
}

function validateUserType(userType: string): boolean {
  return ['patient', 'nutritionist'].includes(userType);
}

function validatePriceId(priceId: string): boolean {
  // Stripe price ID format validation
  return typeof priceId === 'string' && priceId.startsWith('price_') && priceId.length > 10;
}

function sanitizeStripeData(data: any) {
  return {
    id: String(data.id || '').slice(0, 100),
    status: String(data.status || '').slice(0, 50),
    customer: String(data.customer || '').slice(0, 100),
  };
}

// Manejar creación de suscripción con validaciones adicionales
async function handleSubscriptionCreated(subscription: any, supabase: any) {
  try {
    console.log('Processing customer.subscription.created', {
      subscriptionId: subscription.id,
      metadata: subscription.metadata,
      items: subscription.items?.data
    })
    
    const userId = subscription.metadata?.user_id
    const userType = subscription.metadata?.user_type || 'patient'
    const priceId = subscription.items?.data?.[0]?.price?.id

    // 🔒 SECURITY VALIDATIONS
    if (!userId || !validateUserId(userId)) {
      throw new Error('Invalid user_id format')
    }

    if (!validateUserType(userType)) {
      throw new Error('Invalid user_type')
    }

    if (!priceId || !validatePriceId(priceId)) {
      throw new Error('Invalid price_id format')
    }

    // 🧹 SANITIZE DATA
    const sanitizedData = sanitizeStripeData(subscription);

    console.log('✅ Validated data:', { userId, userType, priceId })

    // Verify user exists in database before creating subscription
    const { data: existingUser, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (userError || !existingUser) {
      throw new Error(`User ${userId} not found in database`)
    }

    console.log('✅ User exists, creating subscription')

    const subscriptionData = {
      user_id: userId,
      user_type: userType,
      stripe_customer_id: sanitizedData.customer,
      stripe_subscription_id: sanitizedData.id,
      status: sanitizedData.status,
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

    // For patients with trials, also create trial record (with validation)
    if (userType === 'patient' && subscription.trial_end) {
      console.log('🎯 Creating trial record for patient')
      
      const trialData = {
        user_id: userId,
        trial_start: new Date(subscription.trial_start! * 1000).toISOString(),
        trial_end: new Date(subscription.trial_end * 1000).toISOString(),
        trial_used: true,
        stripe_subscription_id: sanitizedData.id,
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
    console.error('💥 Security violation or error in handleSubscriptionCreated:', error)
    throw error
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