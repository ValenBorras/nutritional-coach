import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patient_key } = body;

    if (!patient_key || typeof patient_key !== 'string') {
      return NextResponse.json(
        { error: "Patient key is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verificar que sea un paciente
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, nutritionist_id')
      .eq('id', user.id)
      .single();

    if (userError || userData?.role !== 'patient') {
      return NextResponse.json(
        { error: "Only patients can connect to nutritionists" },
        { status: 403 }
      );
    }

    // Verificar si ya tiene nutricionista
    if (userData?.nutritionist_id) {
      return NextResponse.json(
        { error: "You are already connected to a nutritionist" },
        { status: 400 }
      );
    }

    // Buscar la clave del paciente
    const { data: patientKeyData, error: keyError } = await supabase
      .from('patient_keys')
      .select('id, used, nutritionist_id, users:nutritionist_id(name, email)')
      .eq('key', patient_key)
      .single();

    if (keyError || !patientKeyData) {
      return NextResponse.json(
        { error: "Invalid patient key" },
        { status: 400 }
      );
    }

    // Verificar si la clave ya fue usada
    if (patientKeyData.used) {
      return NextResponse.json(
        { error: "This patient key has already been used" },
        { status: 400 }
      );
    }

    // Iniciar transacción para actualizar tanto la clave como el usuario
    const { error: updateKeyError } = await supabase
      .from('patient_keys')
      .update({
        used: true,
        used_at: new Date().toISOString(),
        patient_id: user.id
      })
      .eq('key', patient_key);

    if (updateKeyError) {
      console.error('Error updating patient key:', updateKeyError);
      return NextResponse.json(
        { error: "Error processing patient key" },
        { status: 500 }
      );
    }

    // Actualizar el usuario para conectarlo con el nutricionista
    const { error: updateUserError } = await supabase
      .from('users')
      .update({
        nutritionist_id: patientKeyData.nutritionist_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateUserError) {
      console.error('Error updating user nutritionist:', updateUserError);
      
      // Revertir el cambio en patient_keys si falla la actualización del usuario
      await supabase
        .from('patient_keys')
        .update({
          used: false,
          used_at: null,
          patient_id: null
        })
        .eq('key', patient_key);

      return NextResponse.json(
        { error: "Error connecting to nutritionist" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Successfully connected to nutritionist",
      nutritionist: patientKeyData.users
    });

  } catch (error) {
    console.error('Connect nutritionist error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 