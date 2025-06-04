import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { amount = 1299, currency = 'usd' } = await req.json();
    
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    console.log('Creating test payment intent for user:', user.email);

    // Create a simple payment intent for testing
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // $12.99
      currency: currency,
      customer: undefined, // We'll let Stripe create one
      metadata: {
        user_id: user.id,
        test: 'true',
      },
    });

    console.log('Test payment intent created:', paymentIntent.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amount,
      currency: currency,
    });

  } catch (error) {
    console.error('Error creating test payment intent:', error);
    
    // Properly handle unknown error type
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    );
  }
} 