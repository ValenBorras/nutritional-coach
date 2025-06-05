import { type NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - api/stripe/webhooks (Stripe webhooks should not go through auth middleware)
     * Exclude specific API routes that should NOT run through this middleware (e.g. public API routes)
     * if needed, using negative lookaheads: /api/(?!public-route).*
     */
    '/((?!_next/static|_next/image|_next/webpack-hmr|favicon.ico|manifest.json|sw.js|icons/|api/stripe/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css|woff|woff2|ttf|eot)$).*)',
  ],
} 