import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { priceId } = await req.json();
    
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID es requerido' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    // Obtener información del precio
    const { data: price, error: priceError } = await supabase
      .from('prices')
      .select('*')
      .eq('id', priceId)
      .single();

    if (priceError || !price) {
      return NextResponse.json(
        { error: 'Precio no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si ya tiene un customer en Stripe
    let customerId: string;
    
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (existingSubscription?.stripe_customer_id) {
      customerId = existingSubscription.stripe_customer_id;
    } else {
      // Crear customer en Stripe
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          user_id: user.id,
          user_type: price.user_type,
        },
      });
      customerId = customer.id;
    }

    // Si hay trial period, crear suscripción directamente (sin payment intent)
    if (price.trial_period_days && price.trial_period_days > 0) {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        trial_period_days: price.trial_period_days,
        metadata: {
          user_id: user.id,
          user_type: price.user_type,
        },
      });

      return NextResponse.json({
        subscriptionId: subscription.id,
        trialSubscription: true,
        trialEnd: subscription.trial_end,
        customerId: customerId,
      });
    }

    // Para suscripciones sin trial, usar un enfoque más robusto
    console.log('Creating subscription without trial...');
    
    // Crear la suscripción sin expandir payment_intent inicialmente
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      metadata: {
        user_id: user.id,
        user_type: price.user_type,
      },
    });

    console.log('Subscription created:', subscription.id);

    // Ahora obtener la invoice por separado
    if (!subscription.latest_invoice) {
      return NextResponse.json(
        { error: 'No se pudo crear la factura' },
        { status: 500 }
      );
    }

    // Obtener la invoice como string ID, luego expandir
    const invoiceId = typeof subscription.latest_invoice === 'string' 
      ? subscription.latest_invoice 
      : subscription.latest_invoice.id;

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'ID de factura inválido' },
        { status: 500 }
      );
    }

    console.log('Getting invoice:', invoiceId);

    try {
      // Intentar obtener la invoice con payment_intent
      const invoice = await stripe.invoices.retrieve(invoiceId, {
        expand: ['payment_intent']
      });

      // Type assertion para payment_intent expandido
      const expandedInvoice = invoice as any;
      const paymentIntent = expandedInvoice.payment_intent;
      
      if (paymentIntent && typeof paymentIntent === 'object' && paymentIntent.id) {
        console.log('Payment intent found:', paymentIntent.id);
        
        return NextResponse.json({
          clientSecret: paymentIntent.client_secret,
          subscriptionId: subscription.id,
          customerId: customerId,
        });
      } else {
        console.log('No payment intent in invoice, creating one manually...');
        
        // Si no hay payment intent, crear uno manualmente
        const paymentIntent = await stripe.paymentIntents.create({
          amount: price.unit_amount || 0,
          currency: price.currency || 'usd',
          customer: customerId,
          metadata: {
            subscription_id: subscription.id,
            user_id: user.id,
          },
        });

        return NextResponse.json({
          subscriptionId: subscription.id,
          clientSecret: paymentIntent.client_secret,
          customerId: customerId,
          manualPaymentIntent: true,
        });
      }
    } catch (invoiceError) {
      console.error('Error retrieving invoice:', invoiceError);
      
      // Fallback: crear payment intent manualmente
      console.log('Creating manual payment intent as fallback...');
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: price.unit_amount || 0,
        currency: price.currency || 'usd',
        customer: customerId,
        metadata: {
          subscription_id: subscription.id,
          user_id: user.id,
        },
      });

      return NextResponse.json({
        subscriptionId: subscription.id,
        clientSecret: paymentIntent.client_secret,
        customerId: customerId,
        fallbackPaymentIntent: true,
      });
    }

  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 