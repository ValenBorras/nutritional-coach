import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const { 
      priceId, 
      quantity = 1, 
      customAmount,
      customerEmail,
      metadata = {} 
    } = await req.json()

    // Validate required fields
    if (!priceId && !customAmount) {
      return NextResponse.json(
        { error: 'Either priceId or customAmount is required' },
        { status: 400 }
      )
    }

    // Validate priceId if provided (ensure it's not empty string)
    const validPriceId = priceId && priceId.trim() !== '' ? priceId.trim() : null
    const validCustomAmount = customAmount && customAmount > 0 ? customAmount : null

    console.log('🔍 Validation results:', {
      originalPriceId: priceId,
      validPriceId,
      originalCustomAmount: customAmount,
      validCustomAmount
    })

    // Get authenticated user (REQUIRED for checkout)
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (!user || authError) {
      console.error('❌ User not authenticated:', authError?.message)
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to continue.' },
        { status: 401 }
      )
    }

    console.log('✅ User authenticated:', { userId: user.id, email: user.email })

    // Determine user type based on price (nutritionist/patient) if using subscription
    let userType: 'patient' | 'nutritionist' = 'patient'
    if (validPriceId) {
      const { data: priceRow } = await supabase
        .from('prices')
        .select('user_type')
        .eq('id', validPriceId)
        .eq('active', true)
        .maybeSingle()
      if (priceRow?.user_type === 'nutritionist') userType = 'nutritionist'
    }
    console.log('✅ Proceeding checkout for', { userId: user.id, userType, priceId: validPriceId })

    // Determine the correct mode based on what we actually have
    const mode = validPriceId ? 'subscription' : 'payment'

    console.log('🔍 Checkout session details:', {
      userId: user.id,
      userEmail: user.email,
      userType,
      priceId: validPriceId,
      customAmount: validCustomAmount,
      mode
    })

    // Prevent duplicate/parallel subscriptions
    const ACTIVE_STATUSES = ['active', 'trialing', 'past_due', 'incomplete']
    const { data: existingSubs } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ACTIVE_STATUSES)
      .order('updated_at', { ascending: false })

    const currentSub = existingSubs?.[0]
    if (currentSub) {
      // If the user already has an active (or similar) subscription, block new checkout
      if (validPriceId && currentSub.price_id === validPriceId) {
        return NextResponse.json(
          { error: 'Ya tienes este plan activo. Gestiona tu suscripción desde el portal.' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'Ya tienes una suscripción activa. Usa el portal para cambiar de plan.' },
        { status: 409 }
      )
    }

    // Prepare line items
    const lineItems: Array<{
      price?: string
      quantity?: number
      price_data?: {
        currency: string
        product_data: {
          name: string
          description: string
        }
        unit_amount: number
      }
    }> = []

    if (validPriceId) {
      // Use existing price from Stripe
      lineItems.push({
        price: validPriceId,
        quantity: quantity,
      })
    } else if (validCustomAmount) {
      // Create custom line item
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'NutriGuide Service',
            description: 'Nutrition guidance and AI chat service',
          },
          unit_amount: validCustomAmount, // Amount in cents
        },
        quantity: 1,
      })
    } else {
      return NextResponse.json(
        { error: 'No valid priceId or customAmount provided' },
        { status: 400 }
      )
    }

    // Enhanced metadata with VERIFIED user information
    const enhancedMetadata = {
      user_id: user.id, // GUARANTEED to exist in profiles table
      user_type: userType,
      user_email: user.email,
      source: 'embedded_checkout',
      payment_type: mode,
      ...metadata,
    }

    console.log('📋 Session metadata:', enhancedMetadata)

    // Create checkout session with embedded UI mode
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded', // 🔥 Key for embedded checkout
      line_items: lineItems,
      mode: mode, // 'subscription' for priceId, 'payment' for customAmount
      
      // Return URL with dynamic session_id parameter
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
      
      // Customer information (required since user is authenticated)
      customer_email: user.email,
      
      // Metadata for tracking
      metadata: enhancedMetadata,

      // Allow promotion codes
      allow_promotion_codes: true,

      // Collect customer address if needed
      billing_address_collection: 'auto',

      // Additional configuration for subscriptions
      ...(mode === 'subscription' && {
        subscription_data: {
          metadata: enhancedMetadata,
        },
      }),
    })

    console.log('✅ Created embedded checkout session:', session.id)

    // Return client_secret for frontend
    return NextResponse.json({
      client_secret: session.client_secret,
      session_id: session.id, // For debugging/logging
    })

  } catch (error) {
    console.error('❌ Error creating checkout session:', error)
    
    // Properly handle unknown error type
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session', 
        details: errorMessage 
      },
      { status: 500 }
    )
  }
} 