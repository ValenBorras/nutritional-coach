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
    console.log('🔍 Checking database schema...')
    
    // Check subscriptions table schema
    const { data: subscriptionsSchema, error: schemaError } = await supabaseServiceRole
      .rpc('exec', { 
        query: `
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default
          FROM information_schema.columns 
          WHERE table_name = 'subscriptions' 
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      })
    
    console.log('Subscriptions schema:', { success: !schemaError, error: schemaError?.message })
    
    // Check foreign key constraints
    const { data: foreignKeys, error: fkError } = await supabaseServiceRole
      .rpc('exec', { 
        query: `
          SELECT 
            tc.constraint_name,
            tc.table_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
          FROM information_schema.table_constraints AS tc
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
          WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name = 'subscriptions'
            AND tc.table_schema = 'public';
        `
      })
    
    console.log('Foreign keys:', { success: !fkError, error: fkError?.message })
    
    // Check if user exists in different tables
    const testUserId = '688ff975-e332-4e2a-9153-8c70331e74e6'
    
    // Check in profiles table
    const { data: profileExists, error: profileError } = await supabaseServiceRole
      .from('profiles')
      .select('id, user_type')
      .eq('id', testUserId)
      .single()
    
    // Check in auth.users table (directly)
    const { data: authExists, error: authError } = await supabaseServiceRole
      .rpc('exec', { 
        query: `SELECT id FROM auth.users WHERE id = '${testUserId}';`
      })
    
    return Response.json({
      subscriptionsSchema: {
        success: !schemaError,
        error: schemaError?.message,
        data: subscriptionsSchema
      },
      foreignKeys: {
        success: !fkError,
        error: fkError?.message,
        data: foreignKeys
      },
      userChecks: {
        testUserId,
        inProfiles: {
          exists: !!profileExists,
          error: profileError?.message,
          data: profileExists
        },
        inAuthUsers: {
          exists: !!authExists && authExists.length > 0,
          error: authError?.message,
          data: authExists
        }
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('🚨 Schema check failed:', error)
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined 
    }, { status: 500 })
  }
} 