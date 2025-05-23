-- Fix RLS policies for authentication issues
-- This script ensures users can read their own data from the users table

-- Drop ALL existing policies from users table
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.users';
    END LOOP;
END $$;

-- Drop ALL existing policies from profiles table
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.profiles';
    END LOOP;
END $$;

-- Ensure RLS is enabled on both tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Allow users to view their own profile (this is essential for authentication)
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile  
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Allow service role to do everything (for registration and admin operations)
CREATE POLICY "Service role full access" ON public.users
  FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to view basic user info for nutritionist-patient relationships
CREATE POLICY "Authenticated users can view basic user info" ON public.users
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      -- Users can always see their own data
      auth.uid() = id OR
      -- Nutritionists can see their patients
      (role = 'patient' AND nutritionist_id = auth.uid()) OR
      -- Patients can see their nutritionist's basic info
      (role = 'nutritionist' AND id IN (
        SELECT nutritionist_id FROM public.users WHERE id = auth.uid()
      ))
    )
  );

-- Profiles table policies
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow service role to do everything
CREATE POLICY "Service role full access" ON public.profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.profiles TO service_role;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema'; 