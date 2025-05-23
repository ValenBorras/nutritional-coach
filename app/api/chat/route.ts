import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, conversationHistory = [] } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get current user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        profiles(*)
      `)
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "User data not found" },
        { status: 404 }
      );
    }

    // Get nutritionist AI rules if user has a nutritionist
    let nutritionistData = null;
    let nutritionistRules = null;
    
    console.log('🔍 DEBUG - User data:', {
      id: userData.id,
      name: userData.name,
      role: userData.role,
      nutritionist_id: userData.nutritionist_id
    });
    
    if (userData.nutritionist_id) {
      console.log('✅ User has nutritionist_id:', userData.nutritionist_id);
      
      // Use admin client to get nutritionist data since RLS might be blocking regular queries
      const adminSupabase = createAdminClient();
      
      // Get nutritionist data directly using admin client
      const { data: nutritionist, error: nutritionistError } = await adminSupabase
        .from('users')
        .select('name, email')
        .eq('id', userData.nutritionist_id)
        .single();
        
      console.log('🔍 Admin nutritionist query:', { nutritionist, error: nutritionistError });
      
      if (!nutritionistError && nutritionist) {
        nutritionistData = nutritionist;
        console.log('✅ Got nutritionist data via admin client:', nutritionistData);
      } else {
        console.log('❌ Could not get nutritionist data, even with admin client');
        // Use a placeholder
        nutritionistData = {
          name: "Your nutritionist",
          email: "nutritionist@example.com"
        };
      }
      
      // Get AI rules using admin client
      const { data: aiRules, error: rulesError } = await adminSupabase
        .from('ai_rules')
        .select('*')
        .eq('user_id', userData.nutritionist_id)
        .single();
        
      console.log('🔍 Admin AI Rules query:', { aiRules, error: rulesError });
        
      if (!rulesError && aiRules) {
        nutritionistRules = aiRules;
        console.log('✅ AI Rules found via admin client:', nutritionistRules);
      } else {
        console.log('⚠️ No AI rules found for nutritionist');
      }
      
      // Also check patient_keys for debugging
      const { data: connectionData, error: connectionError } = await supabase
        .from('patient_keys')
        .select('nutritionist_id, used, patient_id')
        .eq('nutritionist_id', userData.nutritionist_id)
        .eq('patient_id', userData.id)
        .eq('used', true)
        .single();
        
      console.log('🔍 Patient_keys verification:', { connectionData, error: connectionError });
      
      if (!connectionData) {
        console.log('⚠️ Warning: User has nutritionist_id but no corresponding patient_keys record');
        console.log('🔧 This suggests the connection was made outside the normal flow or there was a data inconsistency');
      }
      
    } else {
      console.log('❌ User does not have nutritionist_id set');
    }

    // Build system prompt based on user type and nutritionist rules
    let systemPrompt = "";
    
    if (userData.role === 'patient') {
      systemPrompt = `You are a helpful nutrition AI assistant for ${userData.name}. 

IMPORTANT CONTEXT:
- User Role: Patient
- User Goals: ${userData.profiles?.goals?.join(', ') || 'General health'}
- Allergies: ${userData.profiles?.allergies?.join(', ') || 'None specified'}
- Dietary Restrictions: ${userData.profiles?.dietary_restrictions?.join(', ') || 'None specified'}
- Medical Conditions: ${userData.profiles?.medical_conditions?.join(', ') || 'None specified'}

${nutritionistData && nutritionistRules ? `
NUTRITIONIST CONNECTION:
- Connected to: ${nutritionistData.name} (${nutritionistData.email})
- Diet Philosophy: ${nutritionistRules.diet_philosophy}
- Response Style: ${nutritionistRules.response_style}
- General Guidelines: ${nutritionistRules.general_guidelines?.join(', ') || 'Standard nutrition advice'}
- Special Instructions: ${nutritionistRules.special_instructions?.join(', ') || 'None'}

IMPORTANT: You are now personalized according to your nutritionist ${nutritionistData.name}'s professional philosophy and approach. Follow their guidelines in all responses.
` : nutritionistData ? `
NUTRITIONIST CONNECTION:
- Connected to: ${nutritionistData.name} (${nutritionistData.email})
- Your nutritionist hasn't configured specific AI guidelines yet, so providing general evidence-based nutrition advice.
` : `
NUTRITIONIST STATUS:
- You are not currently connected to a specific nutritionist
- Providing general evidence-based nutrition advice
- You can connect with a nutritionist using their patient key for personalized guidance
`}

RESPONSE GUIDELINES:
- Be supportive, encouraging, and professional
- Provide practical, actionable advice
- Consider the user's specific context (allergies, restrictions, goals)
- If asked about medical conditions, remind them to consult healthcare professionals
- Keep responses conversational but informative
- Use Spanish as the primary language unless requested otherwise
- Be empathetic and understanding of challenges
${nutritionistData ? `- Always mention that your guidance is based on ${nutritionistData.name}'s professional approach when relevant` : ''}

Remember: You are not a replacement for professional medical advice, but a supportive tool to help with nutrition guidance.`;

    } else if (userData.role === 'nutritionist') {
      systemPrompt = `You are an AI assistant for ${userData.name}, a professional nutritionist.

CONTEXT:
- User Role: Nutritionist
- You're helping them with their practice and patient care

CAPABILITIES:
- Help with meal planning and nutrition advice
- Assist with patient management strategies
- Provide evidence-based nutrition information
- Help with creating educational content
- Support with administrative tasks related to nutrition practice

RESPONSE GUIDELINES:
- Respond as a professional colleague
- Provide evidence-based information
- Help with practice management
- Use professional terminology appropriately
- Be efficient and practical in responses
- Use Spanish as the primary language unless requested otherwise

You're here to support their professional practice and enhance their ability to help patients.`;
    }

    console.log('🔍 DEBUG - Final connection status:', {
      hasNutritionist: !!nutritionistData,
      hasRules: !!nutritionistRules,
      nutritionistName: nutritionistData?.name,
      rulesCount: nutritionistRules ? Object.keys(nutritionistRules).length : 0
    });

    console.log('📝 System prompt being sent:', systemPrompt.substring(0, 500) + '...');

    // Prepare conversation for OpenAI
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: "user", content: message }
    ];

    // Call OpenAI API
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Using the more affordable model for MVP
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    });

    if (!openaiResponse.ok) {
      console.error("OpenAI API error:", await openaiResponse.text());
      return NextResponse.json(
        { error: "AI service temporarily unavailable" },
        { status: 503 }
      );
    }

    const aiData = await openaiResponse.json();
    const aiMessage = aiData.choices[0]?.message?.content;

    if (!aiMessage) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    // Optional: Store conversation in database for future analysis
    // You could add a conversations table to track chat history

    return NextResponse.json({
      message: aiMessage,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 