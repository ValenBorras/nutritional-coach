-- Migration to add chat system tables
-- Add this to your existing schema

-- Create chat status enum
CREATE TYPE chat_status AS ENUM ('active', 'archived', 'deleted');

-- Create Chats table
CREATE TABLE public.chats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Nueva conversación',
  summary TEXT, -- AI-generated summary of the conversation
  status chat_status DEFAULT 'active',
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Messages table  
CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  tokens_used INTEGER, -- For tracking API usage
  model_used TEXT, -- Track which AI model was used
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chats
CREATE POLICY "Users can view own chats" ON public.chats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chats" ON public.chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chats" ON public.chats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chats" ON public.chats
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for messages
CREATE POLICY "Users can view messages from own chats" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chats 
      WHERE id = chat_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to own chats" ON public.messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chats 
      WHERE id = chat_id AND user_id = auth.uid()
    )
  );

-- Nutritionists can view messages from their patients' chats (optional)
CREATE POLICY "Nutritionists can view patient messages" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chats c
      JOIN public.users u ON c.user_id = u.id
      WHERE c.id = chat_id 
      AND u.nutritionist_id = auth.uid()
    )
  );

-- Create updated_at trigger for chats
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON public.chats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update chat last_message_at when new message is added
CREATE OR REPLACE FUNCTION update_chat_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.chats 
    SET last_message_at = NEW.created_at 
    WHERE id = NEW.chat_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update chat last_message_at
CREATE TRIGGER update_chat_last_message_trigger 
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION update_chat_last_message();

-- Create indexes for performance
CREATE INDEX idx_chats_user_id ON public.chats(user_id);
CREATE INDEX idx_chats_status ON public.chats(status);
CREATE INDEX idx_chats_last_message_at ON public.chats(last_message_at DESC);
CREATE INDEX idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_messages_role ON public.messages(role); 