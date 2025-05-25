import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { nanoid } from "nanoid"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(req: Request) {
  try {
    console.log('Recibiendo solicitud de registro...');
    const body = await req.json()
    console.log('Datos recibidos:', { ...body, password: '[REDACTED]' });

    const {
      email,
      password,
      name,
      role,
      nutritionistKey,
      dietPhilosophy,
      birthDate,
      height,
      weight,
      gender,
      activityLevel,
      goals,
      allergies,
      dietaryRestrictions,
      medicalConditions,
      ...otherData
    } = body

    if (!email || !password || !name || !role) {
      console.log('Faltan campos requeridos:', { email: !!email, password: !!password, name: !!name, role: !!role });
      return NextResponse.json(
        { message: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    console.log('Inicializando clientes de Supabase...');
    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    // Verificar configuración del admin client
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Variables de entorno faltantes:', {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      });
      return NextResponse.json(
        { message: "Error de configuración del servidor" },
        { status: 500 }
      )
    }

    console.log('Verificando si el usuario ya existe...');
    // Verificar si el usuario ya existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      console.log('Usuario ya existe:', email);
      return NextResponse.json(
        { message: "El usuario ya existe" },
        { status: 400 }
      )
    }

    // If patient is registering with nutritionist key, verify it exists and is not used
    let nutritionistId = null
    let patientKeyRecord = null
    if (role === "patient" && nutritionistKey) {
      console.log('Verificando clave de nutricionista:', nutritionistKey);
      
      // Check if the key exists in patient_keys table and is not used
      const { data: keyRecord, error: keyError } = await supabase
        .from('patient_keys')
        .select('id, nutritionist_id, used, patient_id')
        .eq('key', nutritionistKey)
        .eq('used', false)
        .single()

      if (keyError || !keyRecord) {
        return NextResponse.json(
          { message: "Clave de nutricionista inválida o ya utilizada" },
          { status: 400 }
        )
      }

      nutritionistId = keyRecord.nutritionist_id
      patientKeyRecord = keyRecord
    }

    // Generate nutritionist key if registering as nutritionist (deprecated, will be removed later)
    let generatedNutritionistKey = null
    if (role === "nutritionist") {
      console.log('Generando clave única para nutricionista...');
      let isUnique = false
      while (!isUnique) {
        generatedNutritionistKey = nanoid(10)
        const { data: existingKey } = await supabase
          .from('users')
          .select('id')
          .eq('nutritionist_key', generatedNutritionistKey)
          .single()
        
        if (!existingKey) {
          isUnique = true
        }
      }
      console.log('Clave generada:', generatedNutritionistKey);
    }

    console.log('Creando usuario en Supabase Auth...');
    // Create user in Supabase Auth (using admin client)
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        name,
        role
      }
    })

    if (authError || !authData.user) {
      console.error('Error creating auth user:', authError);
      return NextResponse.json(
        { message: `Error al crear usuario de autenticación: ${authError?.message || 'Usuario no creado'}` },
        { status: 500 }
      )
    }

    console.log('Usuario Auth creado exitosamente:', authData.user.id);

    // Preparar los datos del perfil según el rol
    const profileData = role === "patient" ? {
      birth_date: birthDate ? new Date(birthDate).toISOString().split('T')[0] : null,
      height: height ? parseFloat(height.toString()) : null,
      weight: weight ? parseFloat(weight.toString()) : null,
      gender,
      activity_level: activityLevel,
      goals: goals ? [goals] : [],
      allergies: allergies || [],
      dietary_restrictions: dietaryRestrictions || [],
      medical_conditions: medicalConditions || [],
    } : {
      specializations: [],
      certifications: [],
      experience: otherData.experience ? parseInt(otherData.experience.toString()) : 0,
    }

    console.log('Creando registro en tabla users...');
    console.log('Datos a insertar:', {
      id: authData.user.id,
      email,
      name,
      role,
      nutritionist_id: nutritionistId,
      nutritionist_key: generatedNutritionistKey,
    });

    // Create user record in our custom users table (using admin client)
    const { data: user, error: userError } = await adminSupabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        name,
        role,
        nutritionist_id: nutritionistId,
        nutritionist_key: generatedNutritionistKey,
      })
      .select()
      .single()

    if (userError) {
      console.error('Error creating user record:', userError);
      console.error('Error details:', JSON.stringify(userError, null, 2));
      // Clean up auth user if database insert fails
      await adminSupabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { message: `Error al crear registro de usuario: ${userError.message}` },
        { status: 500 }
      )
    }

    console.log('Usuario creado en tabla users:', user);

    console.log('Creando perfil de usuario...');
    console.log('Datos del perfil:', profileData);

    // Create user profile (using admin client for consistency)
    const { error: profileError } = await adminSupabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        ...profileData,
      })

    if (profileError) {
      console.error('Error creating profile:', profileError);
      console.error('Profile error details:', JSON.stringify(profileError, null, 2));
      // Clean up user records if profile creation fails
      await adminSupabase.from('users').delete().eq('id', authData.user.id)
      await adminSupabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { message: `Error al crear perfil de usuario: ${profileError.message}` },
        { status: 500 }
      )
    }

    console.log('Perfil creado exitosamente');

    console.log('Usuario creado exitosamente:', { id: user.id, email: user.email, role: user.role });

    // If patient used a key, mark it as used
    if (role === "patient" && patientKeyRecord) {
      console.log('Marcando clave como utilizada...');
      const { error: updateKeyError } = await adminSupabase
        .from('patient_keys')
        .update({
          used: true,
          used_at: new Date().toISOString(),
          patient_id: authData.user.id
        })
        .eq('id', patientKeyRecord.id)

      if (updateKeyError) {
        console.error('Error marking key as used:', updateKeyError);
        // This is not critical enough to fail the registration
      } else {
        console.log('Clave marcada como utilizada exitosamente');
      }
    }

    // If nutritionist, create AI rules (using admin client)
    if (role === "nutritionist") {
      console.log('Creando reglas de IA para nutricionista...');
      const { error: aiRulesError } = await adminSupabase
        .from('ai_rules')
        .insert({
          user_id: authData.user.id,
          diet_philosophy: dietPhilosophy || "",
          general_guidelines: [],
          response_style: "professional",
          special_instructions: [],
        })

      if (aiRulesError) {
        console.error('Error creating AI rules:', aiRulesError);
        console.error('AI rules error details:', JSON.stringify(aiRulesError, null, 2));
        // AI rules creation failure is not critical, so we continue
      } else {
        console.log('Reglas de IA creadas exitosamente');
      }
    }

    return NextResponse.json(
      { 
        message: "Usuario registrado exitosamente",
        nutritionistKey: generatedNutritionistKey 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error detallado al registrar usuario:", error);
    
    // Manejar otros tipos de errores
    if (error instanceof Error) {
      return NextResponse.json(
        { message: `Error al registrar usuario: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: "Error al registrar usuario" },
      { status: 500 }
    )
  }
} 