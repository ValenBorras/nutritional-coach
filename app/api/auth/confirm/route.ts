import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  if (!token_hash || !type) {
    return NextResponse.json(
      { error: 'Missing token_hash or type parameter' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  // Verify the OTP token
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash,
    type: type as any
  })

  if (error) {
    console.error('Email verification error:', error)
    return NextResponse.redirect(new URL('/verify-email?error=verification_failed', request.url))
  }

  if (data.user?.email_confirmed_at) {
    // Email successfully verified, redirect to verify-email page with success
    return NextResponse.redirect(new URL('/verify-email?verified=true', request.url))
  }

  return NextResponse.redirect(new URL('/verify-email?error=unknown', request.url))
} 