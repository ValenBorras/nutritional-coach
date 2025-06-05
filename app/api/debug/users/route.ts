import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET(req: NextRequest) {
  try {
    // Get recent users with their profiles
    const { data: users, error } = await supabaseServiceRole
      .from('profiles')
      .select('id, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    // Also check existing subscriptions
    const { data: subscriptions, error: subError } = await supabaseServiceRole
      .from('subscriptions')
      .select('user_id, status, price_id, stripe_subscription_id')
      .limit(5)

    return Response.json({
      users: users || [],
      existingSubscriptions: subscriptions || [],
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
} 