import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasStripeSecretKey: !!process.env.STRIPE_SECRET_KEY,
    hasStripePublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    publishableKeyPrefix: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 20) + '...',
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV
  })
} 