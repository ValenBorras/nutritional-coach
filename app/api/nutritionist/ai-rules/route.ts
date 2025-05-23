import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET - Obtener reglas de IA actuales
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verificar que sea nutricionista
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || userData?.role !== 'nutritionist') {
      return NextResponse.json(
        { error: "Only nutritionists can access AI rules" },
        { status: 403 }
      );
    }

    // Obtener reglas de IA
    const { data: aiRules, error: rulesError } = await supabase
      .from('ai_rules')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (rulesError && rulesError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching AI rules:', rulesError);
      return NextResponse.json(
        { error: "Error fetching AI rules" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      rules: aiRules || null
    });

  } catch (error) {
    console.error('AI rules GET error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST/PUT - Crear o actualizar reglas de IA
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      diet_philosophy, 
      general_guidelines, 
      response_style, 
      special_instructions 
    } = body;

    // Validación básica
    if (!diet_philosophy || !response_style) {
      return NextResponse.json(
        { error: "Diet philosophy and response style are required" },
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

    // Verificar que sea nutricionista
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || userData?.role !== 'nutritionist') {
      return NextResponse.json(
        { error: "Only nutritionists can configure AI rules" },
        { status: 403 }
      );
    }

    // Verificar si ya existen reglas
    const { data: existingRules, error: checkError } = await supabase
      .from('ai_rules')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const rulesData = {
      user_id: user.id,
      diet_philosophy,
      general_guidelines: general_guidelines || [],
      response_style,
      special_instructions: special_instructions || [],
      updated_at: new Date().toISOString()
    };

    let result;

    if (existingRules) {
      // Actualizar reglas existentes
      const { data, error } = await supabase
        .from('ai_rules')
        .update(rulesData)
        .eq('user_id', user.id)
        .select()
        .single();

      result = { data, error };
    } else {
      // Crear nuevas reglas
      const { data, error } = await supabase
        .from('ai_rules')
        .insert({
          ...rulesData,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      result = { data, error };
    }

    if (result.error) {
      console.error('Error saving AI rules:', result.error);
      return NextResponse.json(
        { error: "Error saving AI rules" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "AI rules saved successfully",
      rules: result.data
    });

  } catch (error) {
    console.error('AI rules POST error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 