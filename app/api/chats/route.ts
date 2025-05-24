import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/chats - Get user's chats
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user's chats ordered by last message
    const { data: chats, error } = await supabase
      .from('chats')
      .select(`
        id,
        title,
        summary,
        status,
        last_message_at,
        created_at,
        messages(content, role, created_at)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error fetching chats:', error);
      return NextResponse.json(
        { error: "Error fetching chats" },
        { status: 500 }
      );
    }

    // Format the response with last message preview
    const formattedChats = chats?.map(chat => ({
      id: chat.id,
      title: chat.title,
      summary: chat.summary,
      lastMessageAt: chat.last_message_at,
      createdAt: chat.created_at,
      lastMessage: chat.messages && chat.messages.length > 0 
        ? chat.messages[chat.messages.length - 1].content.substring(0, 100) + '...'
        : null,
      messageCount: chat.messages?.length || 0
    })) || [];

    return NextResponse.json({ chats: formattedChats });

  } catch (error) {
    console.error('Chats API error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/chats - Create new chat
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { title } = await req.json();

    // Create new chat
    const { data: chat, error } = await supabase
      .from('chats')
      .insert({
        user_id: user.id,
        title: title || 'Nueva conversación',
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating chat:', error);
      return NextResponse.json(
        { error: "Error creating chat" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      chat: {
        id: chat.id,
        title: chat.title,
        createdAt: chat.created_at,
        lastMessageAt: chat.last_message_at
      }
    });

  } catch (error) {
    console.error('Create chat API error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 