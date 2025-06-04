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

    // Get authenticated user (optional - can work without auth)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

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

    if (priceId) {
      // Use existing price from Stripe
      lineItems.push({
        price: priceId,
        quantity: quantity,
      })
    } else if (customAmount) {
      // Create custom line item
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'NutriGuide Service',
            description: 'Nutrition guidance and AI chat service',
          },
          unit_amount: customAmount, // Amount in cents
        },
        quantity: 1,
      })
    }

    // Determine the correct mode based on payment type
    const mode = priceId ? 'subscription' : 'payment'

    // Create checkout session with embedded UI mode
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded', // 🔥 Key for embedded checkout
      line_items: lineItems,
      mode: mode, // 'subscription' for priceId, 'payment' for customAmount
      
      // Return URL with dynamic session_id parameter
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
      
      // Optional: Customer information
      customer_email: customerEmail || user?.email,
      
      // Metadata for tracking
      metadata: {
        user_id: user?.id || 'anonymous',
        source: 'embedded_checkout',
        payment_type: mode,
        ...metadata,
      },

      // Allow promotion codes
      allow_promotion_codes: true,

      // Collect customer address if needed
      billing_address_collection: 'auto',

      // Additional configuration for subscriptions
      ...(mode === 'subscription' && {
        subscription_data: {
          metadata: {
            user_id: user?.id || 'anonymous',
            ...metadata,
          },
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