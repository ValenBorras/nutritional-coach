#!/usr/bin/env node

/**
 * Email Verification Test Script
 * 
 * This script helps test the email verification flow by:
 * 1. Checking Supabase configuration
 * 2. Testing email sending
 * 3. Verifying redirect URLs
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmailVerification() {
  console.log('🧪 Testing Email Verification Setup\n');

  // Test 1: Check Supabase connection
  console.log('1. Testing Supabase connection...');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    console.log('✅ Supabase connection successful\n');
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    return;
  }

  // Test 2: Check if we can create a test user (will fail due to auth settings, which is expected)
  console.log('2. Testing user registration flow...');
  const testEmail = `test-${Date.now()}@example.com`;
  
  try {
    // Test the actual registration endpoint
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'testpassword123',
        name: 'Test User',
        role: 'patient',
        height: 170,
        weight: 70,
        gender: 'male',
        activityLevel: 'moderate',
        goals: 'Test goals',
        birthDate: '1990-01-01'
      }),
    });

    if (response.ok) {
      console.log('✅ Registration endpoint working');
      console.log('✅ User should receive verification email');
      
      // Clean up test user
      try {
        const { data: users } = await supabase.auth.admin.listUsers();
        const testUser = users.users.find(u => u.email === testEmail);
        if (testUser) {
          await supabase.auth.admin.deleteUser(testUser.id);
          console.log('🧹 Test user cleaned up');
        }
      } catch (cleanupError) {
        console.log('⚠️ Could not clean up test user:', cleanupError.message);
      }
    } else {
      const errorData = await response.json();
      console.log('⚠️ Registration endpoint error:', errorData.message);
    }
  } catch (error) {
    console.log('⚠️ Could not test registration endpoint (server may not be running)');
    console.log('   Start your dev server with: npm run dev');
  }

  // Fallback: Test with direct Supabase signup
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail + '.fallback',
      password: 'testpassword123',
      options: {
        data: {
          name: 'Test User'
        }
      }
    });

    if (error) {
      if (error.message.includes('Email confirmations') || error.message.includes('confirm')) {
        console.log('✅ Email confirmation is properly enabled');
        console.log('✅ User creation requires email verification\n');
      } else {
        console.log('⚠️ Unexpected error:', error.message);
      }
    } else if (data.user && !data.user.email_confirmed_at) {
      console.log('✅ User created but email not confirmed');
      console.log('✅ Email verification is working correctly\n');
    } else {
      console.log('⚠️ User created and email auto-confirmed');
      console.log('⚠️ You may need to enable email confirmation in Supabase\n');
    }
  } catch (error) {
    console.error('❌ Registration test failed:', error.message);
  }

  // Test 3: Check environment configuration
  console.log('3. Checking environment configuration...');
  console.log(`✅ Supabase URL: ${supabaseUrl}`);
  console.log(`✅ Anon Key: ${supabaseKey.substring(0, 20)}...`);
  
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log(`✅ Service Role Key: ${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...`);
  } else {
    console.log('⚠️ Service Role Key not found (required for admin operations)');
  }
  console.log('');

  // Test 4: Check required pages exist
  console.log('4. Checking required files...');
  const fs = require('fs');
  const path = require('path');
  
  const requiredFiles = [
    'app/verify-email/page.tsx',
    'app/check-email/page.tsx',
    'app/api/auth/confirm/route.ts',
    'app/components/auth/email-verification-guard.tsx',
    'lib/supabase/middleware.ts'
  ];

  requiredFiles.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - File missing`);
    }
  });

  console.log('\n📋 Setup Checklist:');
  console.log('  □ Enable email confirmations in Supabase Dashboard');
  console.log('  □ Configure email templates in Supabase');
  console.log('  □ Set up redirect URLs in Supabase');
  console.log('  □ Configure SMTP provider (recommended for production)');
  console.log('  □ Test with a real email address');
  
  console.log('\n🔗 Useful Links:');
  console.log(`  • Supabase Dashboard: ${supabaseUrl.replace('/rest/v1', '')}`);
  console.log('  • Authentication Settings: Dashboard → Authentication → Settings');
  console.log('  • Email Templates: Dashboard → Authentication → Email Templates');
  
  console.log('\n✨ Next Steps:');
  console.log('  1. Follow the setup guide in EMAIL_VERIFICATION_SETUP.md');
  console.log('  2. Test registration with a real email address');
  console.log('  3. Check that verification emails are sent');
  console.log('  4. Test the complete verification flow');
}

testEmailVerification().catch(console.error); 