import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';

export async function POST() {
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
        { message: 'No autorizado - Solo nutricionistas pueden generar claves' },
        { status: 403 }
      );
    }

    // Generate a unique key
    let patientKey;
    let isUnique = false;

    while (!isUnique) {
      // Generate a 10-character key
      patientKey = nanoid(10);

      // Check if the key already exists in patient_keys table
      const { data: existingKey } = await supabase
        .from('patient_keys')
        .select('id')
        .eq('key', patientKey)
        .single();

      if (!existingKey) {
        isUnique = true;
      }
    }

    // Insert the new patient key
    const { data: newKey, error: insertError } = await supabase
      .from('patient_keys')
      .insert({
        nutritionist_id: user.id,
        key: patientKey,
        used: false
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting patient key:', insertError);
      return NextResponse.json(
        { message: 'Error al crear la clave' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      key: patientKey,
      id: newKey.id,
      message: 'Clave generada exitosamente'
    }, { status: 200 });
  } catch (error) {
    console.error('Error generating patient key:', error);
    return NextResponse.json(
      { message: 'Error al generar la clave' },
      { status: 500 }
    );
  }
} 