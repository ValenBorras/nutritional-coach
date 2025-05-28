import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { 
      id, 
      email, 
      name, 
      height, 
      weight, 
      birthDate, 
      gender, 
      activityLevel, 
      goals, 
      allergies, 
      dietaryRestrictions, 
      medicalConditions, 
      nutritionistKey 
    } = await request.json();

    if (!id || !email || !name) {
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

    console.log('🔐 Creating/updating OAuth patient:', email);

    // Use upsert to create or update user record
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        id,
        email,
        name,
        role: 'patient',
        email_verified: new Date().toISOString(), // OAuth users are automatically verified
        nutritionist_key: nutritionistKey || null,
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (userError) {
      console.error('❌ Error creating/updating OAuth user:', userError);
      return NextResponse.json(
        { success: false, error: 'Failed to create user', details: userError.message },
        { status: 500 }
      );
    }

    // Use upsert for profile as well
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: id,
        birth_date: birthDate || null,
        height: height || null,
        weight: weight || null,
        gender: gender || null,
        activity_level: activityLevel || null,
        goals: goals ? [goals] : [],
        allergies: allergies || [],
        dietary_restrictions: dietaryRestrictions || [],
        medical_conditions: medicalConditions || [],
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Error creating/updating OAuth profile:', profileError);
      // Don't fail the request for profile creation error, but log it
    }

    console.log('✅ OAuth user created/updated successfully:', email);

    return NextResponse.json({
      success: true,
      user: userData,
      profile: profileData,
    });

  } catch (error) {
    console.error('❌ Unexpected error creating OAuth user:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 