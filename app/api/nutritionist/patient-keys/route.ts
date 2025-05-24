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

    // Get patient IDs that have used keys
    const usedPatientIds = patientKeys
      ?.filter(key => key.used && key.patient_id)
      .map(key => key.patient_id) || [];

    // Get user information for these patients (using admin client to bypass RLS)
    let patientUsers: any[] = [];
    if (usedPatientIds.length > 0) {
      console.log('🔍 DEBUG - Looking for patient IDs:', usedPatientIds);
      
      // Try with admin client first to bypass RLS
      console.log('🔄 Using admin client to bypass RLS...');
      const adminSupabase = createAdminClient();
      const { data: adminUsers, error: adminUsersError } = await adminSupabase
        .from('users')
        .select('id, name, email')
        .in('id', usedPatientIds);

      if (adminUsersError) {
        console.error('Error fetching users with admin client:', adminUsersError);
        
        // Fallback to regular client
        console.log('🔄 Fallback to regular client...');
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, name, email')
          .in('id', usedPatientIds);

        if (usersError) {
          console.error('Error fetching users with regular client:', usersError);
        } else {
          patientUsers = users || [];
          console.log('✅ Successfully fetched users with regular client');
        }
      } else {
        patientUsers = adminUsers || [];
        console.log('✅ Successfully fetched users with admin client');
      }
    }

    // Combine the data
    const enrichedKeys = patientKeys?.map(key => ({
      ...key,
      users: key.patient_id ? patientUsers.find(user => user.id === key.patient_id) || null : null
    })) || [];

    // Debug logging
    console.log('🔍 DEBUG - Patient users found:', patientUsers.length);
    console.log('🔍 DEBUG - Enriched keys:', JSON.stringify(enrichedKeys, null, 2));

    return NextResponse.json({ 
      keys: enrichedKeys
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching patient keys:', error);
    return NextResponse.json(
      { message: 'Error al obtener las claves' },
      { status: 500 }
    );
  }
} 