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

    // Verify user is a nutritionist
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'nutritionist') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get active patients count
    const { count: activePatientsCount } = await supabase
      .from('patient_keys')
      .select('*', { count: 'exact', head: true })
      .eq('nutritionist_id', user.id)
      .eq('used', true);

    // Get generated keys count
    const { count: generatedKeysCount } = await supabase
      .from('patient_keys')
      .select('*', { count: 'exact', head: true })
      .eq('nutritionist_id', user.id);

    // Get AI consultations count (count of chats from connected patients)
    // First get all patient IDs connected to this nutritionist
    const { data: connectedPatients } = await supabase
      .from('users')
      .select('id')
      .eq('nutritionist_id', user.id)
      .eq('role', 'patient');

    const patientIds = connectedPatients?.map(p => p.id) || [];

    // Then count chats from these patients
    let aiConsultationsCount = 0;
    if (patientIds.length > 0) {
      const { count } = await supabase
        .from('chats')
        .select('*', { count: 'exact', head: true })
        .in('user_id', patientIds);
      aiConsultationsCount = count || 0;
    }

    return NextResponse.json({
      activePatients: activePatientsCount || 0,
      aiConsultations: aiConsultationsCount || 0,
      generatedKeys: generatedKeysCount || 0,
    });

  } catch (error) {
    console.error('Error fetching nutritionist stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 