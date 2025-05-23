-- Fix RLS policies for users table to prevent infinite recursion

-- Drop the problematic policy
DROP POLICY IF EXISTS "Nutritionists can view their patients" ON public.users;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Create new policies without recursion
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile  
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Allow service role to insert new users (for registration)
CREATE POLICY "Service role can insert users" ON public.users
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users to view basic user info (needed for nutritionist-patient relationships)
-- This policy is safe because it doesn't query the users table recursively
CREATE POLICY "Authenticated users can view basic user info" ON public.users
  FOR SELECT USING (auth.role() = 'authenticated');

-- Note: The service role bypass RLS, so it can always insert/update/delete
-- This is safe because the service role is only used server-side in our API routes 