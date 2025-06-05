import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Test webhook functionality with the same setup as the real webhook
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
    console.log('🔧 Testing webhook setup...')
    
    // Test 1: Environment variables
    const envTest = {
      hasPublicUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    }
    
    console.log('Environment variables:', envTest)
    
    // Test 2: Supabase connection
    const { data: dbTest, error: dbError } = await supabaseServiceRole
      .from('profiles')
      .select('id')
      .limit(1)
    
    console.log('Database connection:', { success: !dbError, error: dbError?.message })
    
    // Test 3: Service role permissions for subscriptions table
    const { data: subsTest, error: subsError } = await supabaseServiceRole
      .from('subscriptions')
      .select('id')
      .limit(1)
    
    console.log('Subscriptions table access:', { success: !subsError, error: subsError?.message })
    
    // Test 4: Service role permissions for patient_trials table  
    const { data: trialsTest, error: trialsError } = await supabaseServiceRole
      .from('patient_trials')
      .select('id')
      .limit(1)
    
    console.log('Patient trials table access:', { success: !trialsError, error: trialsError?.message })
    
    // Test 5: Test validation functions
    const validationTests = {
      validUserId: validateUserId('550e8400-e29b-41d4-a716-446655440000'),
      invalidUserId: validateUserId('invalid-uuid'),
      validUserType: validateUserType('patient'),
      invalidUserType: validateUserType('invalid'),
      validPriceId: validatePriceId('price_1RVDer4E1fMQUCHe1bi3YujU'),
      invalidPriceId: validatePriceId('invalid-price'),
    }
    
    console.log('Validation tests:', validationTests)
    
    const results = {
      environment: envTest,
      database: { success: !dbError, error: dbError?.message },
      subscriptions: { success: !subsError, error: subsError?.message },
      trials: { success: !trialsError, error: trialsError?.message },
      validations: validationTests,
      timestamp: new Date().toISOString()
    }
    
    return Response.json(results)
    
  } catch (error) {
    console.error('🚨 Debug test failed:', error)
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined 
    }, { status: 500 })
  }
}

// Copy validation functions from webhook
function validateUserId(userId: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(userId);
}

function validateUserType(userType: string): boolean {
  return ['patient', 'nutritionist'].includes(userType);
}

function validatePriceId(priceId: string): boolean {
  return typeof priceId === 'string' && priceId.startsWith('price_') && priceId.length > 10;
} 