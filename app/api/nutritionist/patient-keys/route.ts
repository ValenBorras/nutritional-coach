import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      );
    }

    // Get the user from the database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (userError || !user || user.role !== 'nutritionist') {
      return NextResponse.json(
        { message: 'No autorizado - Solo nutricionistas pueden ver sus claves' },
        { status: 403 }
      );
    }

    // Get all patient keys for this nutritionist
    const { data: patientKeys, error: keysError } = await supabase
      .from('patient_keys')
      .select(`
        id,
        key,
        used,
        used_at,
        created_at,
        patient_id
      `)
      .eq('nutritionist_id', user.id)
      .order('created_at', { ascending: false });

    if (keysError) {
      console.error('Error fetching patient keys:', keysError);
      return NextResponse.json(
        { message: 'Error al obtener las claves' },
        { status: 500 }
      );
    }

    // Get ALL patients connected to this nutritionist (regardless of how they connected)
    const adminSupabase = createAdminClient();
    const { data: connectedPatients, error: patientsError } = await adminSupabase
      .from('users')
      .select('id, name, email, image')
      .eq('nutritionist_id', user.id)
      .eq('role', 'patient');

    if (patientsError) {
      console.error('Error fetching connected patients:', patientsError);
      return NextResponse.json(
        { message: 'Error al obtener los pacientes conectados' },
        { status: 500 }
      );
    }

    console.log('🔍 DEBUG - Connected patients found:', connectedPatients?.length || 0);

    // Get patient IDs that have used keys
    const usedPatientIds = patientKeys
      ?.filter(key => key.used && key.patient_id)
      .map(key => key.patient_id) || [];

    console.log('🔍 DEBUG - Patient IDs with used keys:', usedPatientIds);

    // Combine the data - enrich keys with patient info
    const enrichedKeys = patientKeys?.map(key => ({
      ...key,
      users: key.patient_id ? connectedPatients?.find(patient => patient.id === key.patient_id) || null : null
    })) || [];

    // Add patients who are connected but don't have a corresponding patient_key record
    // This can happen if they connected after registration or if there are data inconsistencies
    const patientsWithoutKeys = connectedPatients?.filter(patient => 
      !usedPatientIds.includes(patient.id)
    ) || [];

    // For patients without keys, create virtual key entries to show them in the UI
    const virtualKeys = patientsWithoutKeys.map(patient => ({
      id: `virtual-${patient.id}`,
      key: 'CONNECTED_POST_REGISTRATION',
      used: true,
      used_at: null, // We don't have this info for post-registration connections
      created_at: null, // We don't have this info
      patient_id: patient.id,
      users: patient,
      isVirtual: true // Flag to indicate this is a virtual entry
    }));

    // Combine real keys and virtual keys
    const allKeys = [...enrichedKeys, ...virtualKeys];

    // Debug logging
    console.log('🔍 DEBUG - Total patients connected:', connectedPatients?.length || 0);
    console.log('🔍 DEBUG - Patients with keys:', usedPatientIds.length);
    console.log('🔍 DEBUG - Patients without keys:', patientsWithoutKeys.length);
    console.log('🔍 DEBUG - Final enriched keys:', JSON.stringify(allKeys, null, 2));

    return NextResponse.json({ 
      keys: allKeys
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching patient keys:', error);
    return NextResponse.json(
      { message: 'Error al obtener las claves' },
      { status: 500 }
    );
  }
} 