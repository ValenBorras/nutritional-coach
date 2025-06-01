import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const debugInfo: any = {
      timestamp: new Date().toISOString(),
      url: request.url,
      origin: request.nextUrl.origin,
      headers: Object.fromEntries(request.headers.entries()),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_URL: process.env.VERCEL_URL,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT_SET',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT_SET',
      }
    }

    // Test Supabase connection
    try {
      const supabase = await createClient()
      const { data: authData, error: authError } = await supabase.auth.getUser()
      
      debugInfo.supabase = {
        connection: 'OK',
        authUser: authData.user ? {
          id: authData.user.id,
          email: authData.user.email,
          provider: authData.user.app_metadata?.provider
        } : null,
        authError: authError?.message || null
      }

      // Test user API
      if (authData.user?.email) {
        try {
          const userResponse = await fetch(`${request.nextUrl.origin}/api/user?email=${authData.user.email}`, {
            headers: {
              'Cookie': request.headers.get('cookie') || '',
            },
          })
          
          debugInfo.userAPI = {
            status: userResponse.status,
            ok: userResponse.ok,
            url: `${request.nextUrl.origin}/api/user?email=${authData.user.email}`
          }

          if (userResponse.ok) {
            const userData = await userResponse.json()
            debugInfo.userAPI.hasUser = !!userData.user
            debugInfo.userAPI.userRole = userData.user?.role
          }
        } catch (apiError) {
          debugInfo.userAPI = {
            error: apiError instanceof Error ? apiError.message : 'Unknown error'
          }
        }
      }

    } catch (supabaseError) {
      debugInfo.supabase = {
        connection: 'ERROR',
        error: supabaseError instanceof Error ? supabaseError.message : 'Unknown error'
      }
    }

    return NextResponse.json(debugInfo, { status: 200 })

  } catch (error) {
    return NextResponse.json({
      error: 'Debug endpoint failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 