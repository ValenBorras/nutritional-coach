import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe/config'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { priceId, successUrl, cancelUrl } = await req.json()
    
    if (!priceId) {
      return Response.json({ error: 'Price ID is required' }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return Response.json({ error: 'User not authenticated' }, { status: 401 })
    }

    // Obtener información del precio y tipo de usuario
    const { data: price, error: priceError } = await supabase
      .from('prices')
      .select('*')
      .eq('id', priceId)
      .eq('active', true)
      .single()

    if (priceError || !price) {
      return Response.json({ error: 'Invalid price ID' }, { status: 400 })
    }

    // Evitar checkout si ya tiene una suscripción activa
    const ACTIVE_STATUSES = ['active', 'trialing', 'past_due', 'incomplete']
    const { data: existingSubs } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ACTIVE_STATUSES)
      .order('updated_at', { ascending: false })

    const currentSub = existingSubs?.[0]
    if (currentSub) {
      if (currentSub.price_id === priceId) {
        return Response.json({ error: 'Ya tienes este plan activo' }, { status: 409 })
      }
      return Response.json({ error: 'Ya tienes una suscripción activa. Usa el portal para cambiar de plan.' }, { status: 409 })
    }

    // Obtener o crear customer en Stripe
    let customerId: string

    // Buscar customer existente
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .not('stripe_customer_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existingSubscription?.stripe_customer_id) {
      customerId = existingSubscription.stripe_customer_id
    } else {
      // Crear nuevo customer
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          user_id: user.id,
          user_type: price.user_type,
        },
      })
      customerId = customer.id
    }

    // Configuración base de la sesión
    const sessionConfig: any = {
      customer: customerId,
      billing_address_collection: 'required',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      metadata: {
        user_id: user.id,
        user_type: price.user_type,
        price_id: priceId,
      },
      success_url: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?canceled=true`,
    }

    // Configurar trial para pacientes
    if (price.user_type === 'patient' && price.trial_period_days) {
      sessionConfig.subscription_data = {
        trial_period_days: price.trial_period_days,
        metadata: {
          user_id: user.id,
          user_type: price.user_type,
          price_id: priceId,
        },
      }
    } else {
      sessionConfig.subscription_data = {
        metadata: {
          user_id: user.id,
          user_type: price.user_type,
          price_id: priceId,
        },
      }
    }

    // Crear sesión de checkout
    const session = await stripe.checkout.sessions.create(sessionConfig)

    return Response.json({ 
      sessionId: session.id,
      url: session.url 
    })

  } catch (error) {
    console.error('Stripe checkout error:', error)
    return Response.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
} 