#!/usr/bin/env node

/**
 * Real Email Test Script
 * 
 * This script tests email verification with a real email address
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRealEmail() {
  console.log('📧 Testing Email Verification with Real Email\n');

  // Get email from command line argument
  const email = process.argv[2];
  
  if (!email) {
    console.log('Usage: node scripts/test-real-email.js your-email@example.com');
    process.exit(1);
  }

  console.log(`Testing with email: ${email}\n`);

  try {
    // Test registration endpoint
    console.log('1. Testing registration...');
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: 'TestPassword123!',
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
      const data = await response.json();
      console.log('✅ Registration successful!');
      console.log('✅ Check your email for verification link');
      console.log(`📧 Email should be sent to: ${email}`);
      
      console.log('\n📋 Next steps:');
      console.log('1. Check your email inbox (and spam folder)');
      console.log('2. Click the verification link');
      console.log('3. You should be redirected to /verify-email');
      console.log('4. Then automatically redirected to /dashboard');
      
      console.log('\n🧹 To clean up this test user later:');
      console.log(`   Go to Supabase Dashboard → Authentication → Users`);
      console.log(`   Find user with email: ${email}`);
      console.log(`   Delete the user manually`);
      
    } else {
      const errorData = await response.json();
      console.error('❌ Registration failed:', errorData.message);
      
      if (errorData.message.includes('ya existe')) {
        console.log('\n💡 User already exists. Try with a different email or delete the existing user first.');
      }
    }
  } catch (error) {
    console.error('❌ Error testing registration:', error.message);
    console.log('\n💡 Make sure your dev server is running: npm run dev');
  }
}

testRealEmail(); 