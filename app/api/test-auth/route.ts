import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(req: Request) {
  try {
    console.log('🧪 Testing server-side database connectivity...')
    
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email') || 'mvalentina.borras@gmail.com'
    
    // Test with regular server client (should respect RLS)
    console.log('📡 Testing regular server client...')
    const supabase = await createClient()
    
    const { data: regularUsers, error: regularError } = await supabase
      .from('users')
      .select('id, email, name, role')
      .eq('email', email)
      .single()
    
    // Test with admin client (should bypass RLS)
    console.log('👑 Testing admin client...')
    const adminSupabase = createAdminClient()
    
    const { data: adminUsers, error: adminError } = await adminSupabase
      .from('users')
      .select('id, email, name, role')
      .eq('email', email)
      .single()
    
    // Test auth service
    console.log('🔐 Testing auth service...')
    const { data: authUsers, error: authError } = await adminSupabase.auth.admin.listUsers()
    const authUser = authUsers?.users?.find(u => u.email === email)
    
    return NextResponse.json({
      success: true,
      email,
      timestamp: new Date().toISOString(),
      tests: {
        regularClient: {
          success: !regularError,
          data: regularUsers,
          error: regularError?.message || null,
          code: regularError?.code || null
        },
        adminClient: {
          success: !adminError,
          data: adminUsers,
          error: adminError?.message || null,
          code: adminError?.code || null
        },
        authService: {
          success: !authError,
          userExists: !!authUser,
          authUserId: authUser?.id || null,
          error: authError?.message || null
        }
      },
      diagnosis: {
        databaseConnectivity: !adminError ? 'WORKING' : 'FAILED',
        rlsPolicies: !regularError ? 'WORKING' : 'BLOCKING',
        authService: !authError ? 'WORKING' : 'FAILED',
        dataConsistency: authUser && adminUsers ? 'CONSISTENT' : 'INCONSISTENT'
      }
    })
  } catch (error) {
    console.error('❌ Test failed:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : null
      },
      { status: 500 }
    )
  }
} 