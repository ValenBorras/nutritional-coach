-- Migration: Sistema de Pagos NutriGuide
-- Descripción: Implementa suscripciones duales para nutricionistas y pacientes
-- Fecha: 2024-12-23

-- Tabla de suscripciones (DUAL: nutricionistas y pacientes)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('nutritionist', 'patient')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'canceled', 'past_due', 'trialing')),
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

-- Tabla de productos/precios de Stripe
CREATE TABLE IF NOT EXISTS prices (
  id TEXT PRIMARY KEY, -- Stripe price ID
  product_id TEXT NOT NULL, -- Stripe product ID
  user_type TEXT NOT NULL CHECK (user_type IN ('nutritionist', 'patient')),
  active BOOLEAN DEFAULT TRUE,
  currency TEXT NOT NULL DEFAULT 'usd',
  unit_amount INTEGER NOT NULL,
  interval TEXT CHECK (interval IN ('month', 'year', 'one_time')),
  interval_count INTEGER DEFAULT 1,
  trial_period_days INTEGER, -- 15 para pacientes, null para nutricionistas
  nickname TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla para rastrear trials de pacientes
CREATE TABLE IF NOT EXISTS patient_trials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  trial_start TIMESTAMPTZ DEFAULT now(),
  trial_end TIMESTAMPTZ DEFAULT (now() + INTERVAL '15 days'),
  trial_used BOOLEAN DEFAULT TRUE,
  stripe_subscription_id TEXT,
  conversion_date TIMESTAMPTZ, -- Cuando convierten a pago
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla para límites de planes (nutricionistas)
CREATE TABLE IF NOT EXISTS plan_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  price_id TEXT REFERENCES prices(id) ON DELETE CASCADE,
  max_patients INTEGER, -- NULL = ilimitado
  features JSONB DEFAULT '{}', -- Features incluidas en el plan
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies para subscriptions
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies para prices (públicas para todos)
CREATE POLICY "Everyone can view active prices" ON prices
  FOR SELECT USING (active = true);

-- RLS Policies para patient_trials
CREATE POLICY "Users can view own trial" ON patient_trials
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trial" ON patient_trials
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trial" ON patient_trials
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies para plan_limits (públicas)
CREATE POLICY "Everyone can view plan limits" ON plan_limits
  FOR SELECT USING (true);

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_type ON subscriptions(user_type);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription ON subscriptions(stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_prices_user_type ON prices(user_type);
CREATE INDEX IF NOT EXISTS idx_prices_active ON prices(active);
CREATE INDEX IF NOT EXISTS idx_prices_interval ON prices(interval);

CREATE INDEX IF NOT EXISTS idx_patient_trials_user_id ON patient_trials(user_id);
CREATE INDEX IF NOT EXISTS idx_patient_trials_trial_end ON patient_trials(trial_end);

CREATE INDEX IF NOT EXISTS idx_plan_limits_price_id ON plan_limits(price_id);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prices_updated_at
    BEFORE UPDATE ON prices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_trials_updated_at
    BEFORE UPDATE ON patient_trials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Función para verificar si un usuario puede agregar más pacientes
CREATE OR REPLACE FUNCTION can_add_patient(nutritionist_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_patients INTEGER;
    max_allowed INTEGER;
    user_subscription RECORD;
BEGIN
    -- Contar pacientes actuales del nutricionista
    SELECT COUNT(*) INTO current_patients
    FROM patient_keys pk
    WHERE pk.nutritionist_id = nutritionist_id 
    AND pk.used_at IS NOT NULL;
    
    -- Obtener límite del plan actual
    SELECT s.*, pl.max_patients INTO user_subscription
    FROM subscriptions s
    LEFT JOIN plan_limits pl ON pl.price_id = s.price_id
    WHERE s.user_id = nutritionist_id 
    AND s.user_type = 'nutritionist'
    AND s.status = 'active'
    ORDER BY s.created_at DESC
    LIMIT 1;
    
    -- Si no tiene suscripción activa, usar límite gratuito (5)
    IF user_subscription.id IS NULL THEN
        max_allowed := 5;
    ELSE
        -- Si max_patients es NULL, significa ilimitado
        IF user_subscription.max_patients IS NULL THEN
            RETURN true;
        END IF;
        max_allowed := user_subscription.max_patients;
    END IF;
    
    RETURN current_patients < max_allowed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener el status de trial de un paciente
CREATE OR REPLACE FUNCTION get_patient_trial_status(patient_id UUID)
RETURNS TABLE (
    has_trial BOOLEAN,
    is_active BOOLEAN,
    days_remaining INTEGER,
    trial_end TIMESTAMPTZ,
    has_subscription BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pt.id IS NOT NULL as has_trial,
        CASE 
            WHEN pt.trial_end > now() THEN true 
            ELSE false 
        END as is_active,
        CASE 
            WHEN pt.trial_end > now() THEN 
                EXTRACT(days FROM (pt.trial_end - now()))::INTEGER
            ELSE 0 
        END as days_remaining,
        pt.trial_end,
        s.id IS NOT NULL AND s.status = 'active' as has_subscription
    FROM patient_trials pt
    LEFT JOIN subscriptions s ON (s.user_id = patient_id AND s.user_type = 'patient' AND s.status = 'active')
    WHERE pt.user_id = patient_id;
    
    -- Si no hay registro de trial, retornar valores por defecto
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, false, 0, null::TIMESTAMPTZ, false;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed data: Precios iniciales con Price IDs reales de Stripe
INSERT INTO prices (id, product_id, user_type, unit_amount, interval, trial_period_days, nickname, metadata) VALUES
-- Planes para Nutricionistas con Price IDs reales
('price_1RVDaj4E1fMQUCHehmZgPtIt', 'prod_SQ3idGmb4LqE0Y', 'nutritionist', 0, 'month', NULL, 'Plan Gratuito', '{"max_patients": 5, "features": ["basic_ai", "basic_dashboard"]}'),
('price_1RVDcc4E1fMQUCHeI84G5DZV', 'prod_SQ3k5hXnvZEk5F', 'nutritionist', 3999, 'month', NULL, 'Profesional Mensual', '{"max_patients": null, "features": ["advanced_ai", "analytics", "export"]}'),
('price_nutri_clinic_monthly', 'prod_nutri_clinic', 'nutritionist', 9900, 'month', NULL, 'Clínica Mensual', '{"max_patients": null, "features": ["multi_nutritionist", "admin_dashboard", "api_access", "white_label"]}'),

-- Plan para Pacientes con Price ID real
('price_1RVDer4E1fMQUCHe1bi3YujU', 'prod_SQ3mk5NnUuvKSs', 'patient', 1299, 'month', 15, 'Plan Paciente', '{"features": ["unlimited_chat", "nutrition_tracking", "notifications"]}')
ON CONFLICT (id) DO NOTHING;

-- Seed data: Límites de planes con Price IDs reales
INSERT INTO plan_limits (price_id, max_patients, features) VALUES
('price_1RVDaj4E1fMQUCHehmZgPtIt', 5, '{"basic_ai": true, "basic_dashboard": true, "email_support": true}'),
('price_1RVDcc4E1fMQUCHeI84G5DZV', NULL, '{"advanced_ai": true, "analytics": true, "export": true, "priority_support": true}'),
('price_nutri_clinic_monthly', NULL, '{"multi_nutritionist": true, "admin_dashboard": true, "api_access": true, "white_label": true, "phone_support": true}')
ON CONFLICT DO NOTHING;

-- Comentarios para documentación
COMMENT ON TABLE subscriptions IS 'Suscripciones de Stripe para nutricionistas y pacientes';
COMMENT ON TABLE prices IS 'Productos y precios sincronizados desde Stripe';
COMMENT ON TABLE patient_trials IS 'Trials gratuitos de 15 días para pacientes';
COMMENT ON TABLE plan_limits IS 'Límites y features por plan de suscripción';

COMMENT ON FUNCTION can_add_patient(UUID) IS 'Verifica si un nutricionista puede agregar más pacientes según su plan';
COMMENT ON FUNCTION get_patient_trial_status(UUID) IS 'Obtiene el estado completo del trial de un paciente'; 