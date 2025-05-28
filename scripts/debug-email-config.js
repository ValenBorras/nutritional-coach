#!/usr/bin/env node

/**
 * Email Configuration Debug Script
 * 
 * This script helps debug email configuration issues
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function debugEmailConfig() {
  console.log('🔍 Debugging Email Configuration\n');

  try {
    // Test 1: Check if we can send a simple confirmation email
    console.log('1. Testing direct email generation...');
    
    const testEmail = `debug-${Date.now()}@example.com`;
    
    // Create a test user first
    const { data: userData, error: userError } = await adminSupabase.auth.admin.createUser({
      email: testEmail,
      password: 'TestPassword123!',
      email_confirm: false
    });

    if (userError) {
      console.error('❌ Error creating test user:', userError.message);
      return;
    }

    console.log('✅ Test user created:', userData.user.id);

    // Try to generate confirmation link
    const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
      type: 'signup',
      email: testEmail,
      password: 'TestPassword123!'
    });

    if (linkError) {
      console.error('❌ Error generating confirmation link:', linkError.message);
      console.error('Full error:', JSON.stringify(linkError, null, 2));
    } else {
      console.log('✅ Confirmation link generated successfully');
      console.log('📧 Email should be sent to:', testEmail);
      console.log('🔗 Confirmation URL:', linkData.properties?.action_link || 'Not available');
    }

    // Clean up test user
    await adminSupabase.auth.admin.deleteUser(userData.user.id);
    console.log('🧹 Test user cleaned up\n');

    // Test 2: Check recent users and their email status
    console.log('2. Checking recent users...');
    const { data: users, error: usersError } = await adminSupabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
    } else {
      const recentUsers = users.users
        .filter(user => user.email && user.email.includes('valentina.borras'))
        .slice(0, 3);
      
      console.log(`Found ${recentUsers.length} matching users:`);
      recentUsers.forEach(user => {
        console.log(`  • ${user.email} - Confirmed: ${!!user.email_confirmed_at} - Created: ${user.created_at}`);
      });
    }

    // Test 3: Try to resend confirmation for existing user
    console.log('\n3. Testing resend confirmation...');
    const existingUser = users.users.find(u => u.email === 'valentina.borras@geekshive.com');
    
    if (existingUser) {
      console.log('Found existing user:', existingUser.email);
      
      // Try to resend confirmation
      const { data: resendData, error: resendError } = await adminSupabase.auth.admin.generateLink({
        type: 'signup',
        email: existingUser.email,
        password: 'TestPassword123!' // This might not work for existing users
      });

      if (resendError) {
        console.log('⚠️ Cannot resend with generateLink (expected for existing users)');
        console.log('Error:', resendError.message);
        
        // Try alternative method - invite user
        console.log('Trying alternative method...');
        const { data: inviteData, error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(
          existingUser.email
        );
        
        if (inviteError) {
          console.error('❌ Invite error:', inviteError.message);
        } else {
          console.log('✅ Invite sent successfully');
        }
      } else {
        console.log('✅ Resend successful');
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }

  console.log('\n📋 Troubleshooting Checklist:');
  console.log('  1. Check Supabase Dashboard → Authentication → Settings');
  console.log('     - Ensure "Enable email confirmations" is ON');
  console.log('  2. Check SMTP Settings in Supabase Dashboard');
  console.log('     - Verify MailerSend credentials are correct');
  console.log('     - Test domain is properly configured in MailerSend');
  console.log('  3. Check MailerSend Dashboard');
  console.log('     - Look for sent emails in activity logs');
  console.log('     - Check if domain is verified');
  console.log('     - Verify API key permissions');
  console.log('  4. Check Supabase Logs');
  console.log('     - Go to Dashboard → Logs → Auth logs');
  console.log('     - Look for email sending errors');
  
  console.log('\n🔗 Useful Links:');
  console.log(`  • Supabase Dashboard: ${supabaseUrl.replace('/rest/v1', '')}`);
  console.log('  • MailerSend Dashboard: https://app.mailersend.com/');
}

debugEmailConfig().catch(console.error); 