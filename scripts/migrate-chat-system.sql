-- Migration script to add chat system to existing NutriGuide database
-- Run this script in your Supabase SQL editor

-- Create chat status enum
DO $$ BEGIN
    CREATE TYPE chat_status AS ENUM ('active', 'archived', 'deleted');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Chats table
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Nueva conversación',
  summary TEXT,
  status chat_status DEFAULT 'active',
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Messages table  
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  tokens_used INTEGER,
  model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS if not already enabled
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can insert own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can update own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can delete own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can view messages from own chats" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages to own chats" ON public.messages;
DROP POLICY IF EXISTS "Nutritionists can view patient messages" ON public.messages;

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

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_chats_updated_at ON public.chats;
DROP TRIGGER IF EXISTS update_chat_last_message_trigger ON public.messages;

-- Create updated_at trigger for chats
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON public.chats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS update_chat_last_message();

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

-- Create indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON public.chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_status ON public.chats(status);
CREATE INDEX IF NOT EXISTS idx_chats_last_message_at ON public.chats(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_role ON public.messages(role);

-- Grant necessary permissions
GRANT ALL ON public.chats TO authenticated;
GRANT ALL ON public.messages TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Verification queries (optional - run these to check if everything was created correctly)
SELECT 'Chats table created' as status, count(*) as row_count FROM public.chats;
SELECT 'Messages table created' as status, count(*) as row_count FROM public.messages;
SELECT 'Indexes created' as status, count(*) as index_count 
FROM pg_indexes 
WHERE tablename IN ('chats', 'messages') AND schemaname = 'public';

COMMIT; 