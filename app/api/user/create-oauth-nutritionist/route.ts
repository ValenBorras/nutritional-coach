import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { id, email, name, experience, dietPhilosophy, specializations, certifications } = await request.json();

    if (!id || !email || !name || experience === undefined || !dietPhilosophy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
            }
          },
        },
      }
    );

    console.log('🔐 Creating/updating OAuth nutritionist:', email);

    // Use upsert to create or update user record
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        id,
        email,
        name,
        role: 'nutritionist',
        email_verified: new Date().toISOString(), // OAuth users are automatically verified
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (userError) {
      console.error('❌ Error creating/updating OAuth nutritionist:', userError);
      return NextResponse.json(
        { success: false, error: 'Failed to create user', details: userError.message },
        { status: 500 }
      );
    }

    // Use upsert for nutritionist profile as well
    const { data: profileData, error: profileError } = await supabase
      .from('nutritionist_profiles')
      .upsert({
        user_id: id,
        experience_years: experience,
        diet_philosophy: dietPhilosophy,
        specializations: specializations || [],
        certifications: certifications || [],
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Error creating/updating OAuth nutritionist profile:', profileError);
      return NextResponse.json(
        { success: false, error: 'Failed to create nutritionist profile', details: profileError.message },
        { status: 500 }
      );
    }

    console.log('✅ OAuth nutritionist created/updated successfully:', email);

    return NextResponse.json({
      success: true,
      user: userData,
      profile: profileData,
    });

  } catch (error) {
    console.error('❌ Unexpected error creating OAuth nutritionist:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 