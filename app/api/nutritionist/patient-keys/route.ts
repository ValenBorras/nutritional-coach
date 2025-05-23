import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
        patient_id,
        users:patient_id (
          name,
          email
        )
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

    return NextResponse.json({ 
      keys: patientKeys || []
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching patient keys:', error);
    return NextResponse.json(
      { message: 'Error al obtener las claves' },
      { status: 500 }
    );
  }
} 