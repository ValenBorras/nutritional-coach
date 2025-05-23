import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userDataError) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get profile data
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      user: userData,
      profile: profileError ? null : profileData,
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userData, profileData } = body;

    // Update user data if provided
    if (userData) {
      const { error: updateUserError } = await supabase
        .from('users')
        .update(userData)
        .eq('id', user.id);

      if (updateUserError) {
        console.error('Error updating user data:', updateUserError);
        return NextResponse.json(
          { error: 'Failed to update user data' },
          { status: 500 }
        );
      }
    }

    // Update or create profile data if provided
    if (profileData) {
      const { error: upsertProfileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          ...profileData,
        });

      if (upsertProfileError) {
        console.error('Error updating profile data:', upsertProfileError);
        return NextResponse.json(
          { error: 'Failed to update profile data' },
          { status: 500 }
        );
      }
    }

    // Return updated data
    const { data: updatedUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    const { data: updatedProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      user: updatedUser,
      profile: updatedProfile,
      message: 'Profile updated successfully',
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 