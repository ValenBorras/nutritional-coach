import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json(
        { message: "Email parameter is required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if user exists in auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      return NextResponse.json(
        { 
          message: "Error checking auth users",
          error: authError.message 
        },
        { status: 500 }
      )
    }

    const authUser = authUsers.users.find(user => user.email === email)

    // Check if user exists in custom users table
    let customUser = null
    let customUserError = null
    
    if (authUser) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()
      
      customUser = data
      customUserError = error
    }

    // Check if profile exists
    let profile = null
    let profileError = null
    
    if (authUser) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single()
      
      profile = data
      profileError = error
    }

    return NextResponse.json({
      email,
      authUser: authUser ? {
        id: authUser.id,
        email: authUser.email,
        created_at: authUser.created_at,
        email_confirmed_at: authUser.email_confirmed_at,
        user_metadata: authUser.user_metadata
      } : null,
      customUser: customUser ? {
        id: customUser.id,
        email: customUser.email,
        name: customUser.name,
        role: customUser.role,
        created_at: customUser.created_at
      } : null,
      customUserError: customUserError?.message || null,
      profile: profile ? {
        user_id: profile.user_id,
        created_at: profile.created_at
      } : null,
      profileError: profileError?.message || null,
      diagnosis: {
        authUserExists: !!authUser,
        customUserExists: !!customUser,
        profileExists: !!profile,
        dataConsistent: !!authUser && !!customUser,
        issue: !authUser ? 'No auth user found' :
               !customUser ? 'Auth user exists but no custom user record' :
               !profile ? 'User exists but no profile (this may be normal)' :
               'All data appears consistent'
      }
    })
  } catch (error) {
    console.error("Debug auth error:", error)
    return NextResponse.json(
      { 
        message: "Internal server error",
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 