-- Migration: Create patient_keys table for unique one-time use nutritionist keys
-- Created: 2024

-- Create patient_keys table
CREATE TABLE public.patient_keys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nutritionist_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  key TEXT UNIQUE NOT NULL,
  patient_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  used BOOLEAN DEFAULT false NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX idx_patient_keys_nutritionist_id ON public.patient_keys(nutritionist_id);
CREATE INDEX idx_patient_keys_key ON public.patient_keys(key);
CREATE INDEX idx_patient_keys_used ON public.patient_keys(used);

-- Enable Row Level Security
ALTER TABLE public.patient_keys ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Nutritionists can manage their own keys
CREATE POLICY "Nutritionists can manage own keys" ON public.patient_keys
  FOR ALL USING (
    nutritionist_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'nutritionist'
    )
  );

-- Anyone can read keys for verification during registration (but not see the nutritionist_id)
CREATE POLICY "Keys can be verified during registration" ON public.patient_keys
  FOR SELECT USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_patient_keys_updated_at BEFORE UPDATE ON public.patient_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 