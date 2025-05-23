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

    // Verify user is a patient
    const { data: profile } = await supabase
      .from('users')
      .select('role, created_at')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'patient') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Calculate active days (days since registration)
    const createdAt = new Date(profile.created_at);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - createdAt.getTime());
    const activeDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Get conversations count
    const { count: conversationsCount } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Get messages count to calculate engagement progress
    const { count: messagesCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Calculate progress percentage based on engagement
    // Base calculation: messages sent vs days active (target ~2 messages per day)
    const targetMessages = Math.max(activeDays * 2, 10); // At least 10 messages target
    const progressPercentage = Math.min(Math.round(((messagesCount || 0) / targetMessages) * 100), 100);

    return NextResponse.json({
      activeDays: activeDays || 1,
      conversations: conversationsCount || 0,
      progress: progressPercentage || 0,
      messagesCount: messagesCount || 0,
    });

  } catch (error) {
    console.error('Error fetching patient stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 