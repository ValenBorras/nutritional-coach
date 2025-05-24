import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/chats/[chatId] - Get specific chat with messages
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
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

    const { chatId } = await params;

    // Get chat with messages
    const { data: chat, error } = await supabase
      .from('chats')
      .select(`
        id,
        title,
        summary,
        status,
        created_at,
        last_message_at,
        messages(
          id,
          role,
          content,
          tokens_used,
          model_used,
          created_at
        )
      `)
      .eq('id', chatId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching chat:', error);
      return NextResponse.json(
        { error: "Chat not found" },
        { status: 404 }
      );
    }

    // Sort messages by creation time
    if (chat.messages) {
      chat.messages.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    }

    return NextResponse.json({ chat });

  } catch (error) {
    console.error('Get chat API error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/chats/[chatId] - Update chat (title, archive, etc.)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
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

    const { chatId } = await params;
    const updates = await req.json();

    // Only allow certain fields to be updated
    const allowedUpdates: any = {};
    if (updates.title) allowedUpdates.title = updates.title;
    if (updates.status && ['active', 'archived'].includes(updates.status)) {
      allowedUpdates.status = updates.status;
    }
    if (updates.summary) allowedUpdates.summary = updates.summary;

    // Update chat
    const { data: chat, error } = await supabase
      .from('chats')
      .update(allowedUpdates)
      .eq('id', chatId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating chat:', error);
      return NextResponse.json(
        { error: "Error updating chat" },
        { status: 500 }
      );
    }

    return NextResponse.json({ chat });

  } catch (error) {
    console.error('Update chat API error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/chats/[chatId] - Delete chat
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
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

    const { chatId } = await params;

    // Delete chat (will cascade delete messages)
    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting chat:', error);
      return NextResponse.json(
        { error: "Error deleting chat" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Chat deleted successfully" });

  } catch (error) {
    console.error('Delete chat API error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 