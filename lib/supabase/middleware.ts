import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define protected routes that require authentication
  const protectedRoutes = ['/dashboard']
  const authRoutes = ['/login', '/register', '/check-email', '/verify-email']
  const allowedRoutes = ['/onboarding'] // Routes that authenticated users can access
  const currentPath = request.nextUrl.pathname

  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => currentPath.startsWith(route))
  const isAuthRoute = authRoutes.some(route => currentPath.startsWith(route))
  const isAllowedRoute = allowedRoutes.some(route => currentPath.startsWith(route))

  if (user) {
    // For OAuth users accessing protected routes, check if they have complete profile data
    if (isProtectedRoute && user.app_metadata?.provider !== 'email') {
      try {
        // Use the correct origin for the API call
        const origin = process.env.NODE_ENV === 'production' 
          ? 'https://nutritional-coach.vercel.app' 
          : request.nextUrl.origin;
        
        // Check if user exists in our database
        const userResponse = await fetch(`${origin}/api/user?email=${user.email}`, {
          headers: {
            'Cookie': request.headers.get('cookie') || '',
          },
        });
        
        if (!userResponse.ok && userResponse.status === 404) {
          // OAuth user doesn't have profile data, redirect to onboarding
          console.log('🔄 OAuth user missing profile data, redirecting to onboarding:', user.email);
          return NextResponse.redirect(new URL('/onboarding', request.url));
        }
      } catch (error) {
        console.error('Error checking user profile:', error);
        // On error, redirect to onboarding to be safe
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
    }

    // User is authenticated, check email verification for protected routes
    if (isProtectedRoute && !user.email_confirmed_at) {
      // Skip email verification check for OAuth users on allowed routes
      const isOAuthUser = user.app_metadata?.provider !== 'email';
      if (!(isOAuthUser && isAllowedRoute)) {
        // Redirect unverified users to check-email page
        const redirectUrl = new URL('/check-email', request.url)
        if (user.email) {
          redirectUrl.searchParams.set('email', user.email)
        }
        return NextResponse.redirect(redirectUrl)
      }
    }

    // If verified user tries to access auth routes (but not onboarding), redirect to dashboard
    if (isAuthRoute && user.email_confirmed_at && currentPath !== '/verify-email' && !isAllowedRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  } else {
    // No user, redirect to login if trying to access protected routes
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely.

  return supabaseResponse
} 