-- =====================================================
-- 💳 NutriGuide Payments System Setup Script
-- =====================================================
-- Execute this script in Supabase SQL Editor
-- Last updated: 2025-06-05

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. SUBSCRIPTIONS TABLE
-- =====================================================
-- This table stores all user subscriptions (both patients and nutritionists)

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL, -- References profiles.user_id (auth user ID)
  user_type TEXT NOT NULL CHECK (user_type IN ('nutritionist', 'patient')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL,
  price_id TEXT NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add foreign key constraint to profiles.user_id (not profiles.id)
-- This points to the auth user ID that's stored in profiles.user_id
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'subscriptions_user_id_fkey'
  ) THEN
    ALTER TABLE public.subscriptions 
    ADD CONSTRAINT subscriptions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- =====================================================
-- 2. PRICES TABLE  
-- =====================================================
-- This table stores Stripe price information

CREATE TABLE IF NOT EXISTS public.prices (
  id TEXT PRIMARY KEY, -- Stripe price ID
  product_id TEXT NOT NULL, -- Stripe product ID
  user_type TEXT NOT NULL CHECK (user_type IN ('nutritionist', 'patient')),
  active BOOLEAN DEFAULT TRUE,
  currency TEXT NOT NULL DEFAULT 'usd',
  unit_amount INTEGER, -- Amount in cents
  interval TEXT, -- month, year
  interval_count INTEGER DEFAULT 1,
  trial_period_days INTEGER, -- 15 for patients, null for nutritionists
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 3. PATIENT TRIALS TABLE
-- =====================================================
-- This table tracks 15-day trials for patients

CREATE TABLE IF NOT EXISTS public.patient_trials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL, -- References auth.users.id (same as profiles.user_id)
  trial_start TIMESTAMPTZ DEFAULT now(),
  trial_end TIMESTAMPTZ DEFAULT (now() + INTERVAL '15 days'),
  trial_used BOOLEAN DEFAULT TRUE,
  stripe_subscription_id TEXT, -- Reference to the subscription
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add foreign key constraint
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'patient_trials_user_id_fkey'
  ) THEN
    ALTER TABLE public.patient_trials 
    ADD CONSTRAINT patient_trials_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add unique constraint to prevent multiple trials per user
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'patient_trials_user_id_unique'
  ) THEN
    ALTER TABLE public.patient_trials 
    ADD CONSTRAINT patient_trials_user_id_unique UNIQUE (user_id);
  END IF;
END $$;

-- =====================================================
-- 4. INDEXES FOR PERFORMANCE
-- =====================================================

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_type ON public.subscriptions(user_type);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription ON public.subscriptions(stripe_subscription_id);

-- Prices indexes
CREATE INDEX IF NOT EXISTS idx_prices_user_type ON public.prices(user_type);
CREATE INDEX IF NOT EXISTS idx_prices_active ON public.prices(active);

-- Patient trials indexes
CREATE INDEX IF NOT EXISTS idx_patient_trials_user_id ON public.patient_trials(user_id);
CREATE INDEX IF NOT EXISTS idx_patient_trials_trial_end ON public.patient_trials(trial_end);

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_trials ENABLE ROW LEVEL SECURITY;

-- Subscriptions policies
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT user_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;
CREATE POLICY "Service role can manage subscriptions" ON public.subscriptions
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Prices policies (public read access for active prices)
DROP POLICY IF EXISTS "Everyone can view active prices" ON public.prices;
CREATE POLICY "Everyone can view active prices" ON public.prices
  FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Service role can manage prices" ON public.prices;
CREATE POLICY "Service role can manage prices" ON public.prices
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Patient trials policies
DROP POLICY IF EXISTS "Users can view own trials" ON public.patient_trials;
CREATE POLICY "Users can view own trials" ON public.patient_trials
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT user_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Service role can manage trials" ON public.patient_trials;
CREATE POLICY "Service role can manage trials" ON public.patient_trials
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- 6. TRIGGER FOR UPDATED_AT TIMESTAMP
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to subscriptions table
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 7. UTILITY FUNCTIONS
-- =====================================================

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.subscriptions 
    WHERE user_id = user_id_param 
    AND status IN ('active', 'trialing')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if patient has active trial
CREATE OR REPLACE FUNCTION public.has_active_trial(user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.patient_trials 
    WHERE user_id = user_id_param 
    AND trial_end > now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get days remaining in trial
CREATE OR REPLACE FUNCTION public.trial_days_remaining(user_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
  trial_end_date TIMESTAMPTZ;
BEGIN
  SELECT trial_end INTO trial_end_date
  FROM public.patient_trials 
  WHERE user_id = user_id_param;
  
  IF trial_end_date IS NULL THEN
    RETURN 0;
  END IF;
  
  RETURN GREATEST(0, EXTRACT(DAY FROM trial_end_date - now())::INTEGER);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. SEED DATA - STRIPE PRICES
-- =====================================================

-- Insert Stripe price data (update these with your actual Stripe price IDs)
INSERT INTO public.prices (
  id, 
  product_id, 
  user_type, 
  active, 
  currency, 
  unit_amount, 
  interval, 
  interval_count, 
  trial_period_days,
  metadata
) VALUES 
-- Patient plan (with 15-day trial)
(
  'price_1RVDer4E1fMQUCHe1bi3YujU',
  'prod_patient_basic',
  'patient',
  true,
  'usd',
  1299, -- $12.99
  'month',
  1,
  15,
  '{"name": "NutriGuide Basic", "description": "Tu nutricionista personal con IA las 24 horas"}'::jsonb
),

-- Nutritionist Free Plan (reference)
(
  'price_1RVDaj4E1fMQUCHehmZgPtIt',
  'prod_nutritionist_free',
  'nutritionist',
  true,
  'usd',
  0, -- Free
  'month',
  1,
  NULL,
  '{"name": "Plan Gratuito", "description": "Hasta 5 pacientes"}'::jsonb
),

-- Nutritionist Professional Plan
(
  'price_1RVDcc4E1fMQUCHeI84G5DZV',
  'prod_nutritionist_pro',
  'nutritionist',
  true,
  'usd',
  3999, -- $39.99
  'month',
  1,
  NULL,
  '{"name": "Plan Profesional", "description": "Pacientes ilimitados"}'::jsonb
)

ON CONFLICT (id) DO UPDATE SET
  active = EXCLUDED.active,
  unit_amount = EXCLUDED.unit_amount,
  metadata = EXCLUDED.metadata;

-- =====================================================
-- 9. VERIFICATION QUERIES
-- =====================================================

-- Uncomment these queries to verify the setup:

-- Check table structure
-- SELECT table_name, column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('subscriptions', 'prices', 'patient_trials')
-- ORDER BY table_name, ordinal_position;

-- Check foreign key constraints
-- SELECT tc.constraint_name, tc.table_name, kcu.column_name, 
--        ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name
-- FROM information_schema.table_constraints AS tc
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage AS ccu
--   ON ccu.constraint_name = tc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY'
--   AND tc.table_name IN ('subscriptions', 'patient_trials');

-- Check RLS policies
-- SELECT schemaname, tablename, policyname, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename IN ('subscriptions', 'prices', 'patient_trials');

-- Check seed data
-- SELECT * FROM public.prices ORDER BY user_type, unit_amount;

-- =====================================================
-- 🎉 SETUP COMPLETE!
-- =====================================================

SELECT 
  '🎉 NutriGuide Payments System Setup Complete!' as status,
  '✅ Tables: subscriptions, prices, patient_trials' as tables_created,
  '✅ Foreign Keys: Pointing to auth.users(id)' as foreign_keys,
  '✅ RLS Policies: Users can view own data' as security,
  '✅ Indexes: Optimized for performance' as performance,
  '✅ Functions: Trial and subscription helpers' as utilities,
  '✅ Seed Data: Stripe price records inserted' as data; 