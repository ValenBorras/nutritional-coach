-- Insert test prices for development and testing
-- Run this in your Supabase SQL editor

-- Insert test prices for patients (with trial)
INSERT INTO prices (id, product_id, user_type, active, currency, unit_amount, interval, interval_count, trial_period_days, metadata) VALUES
('price_test_patient_monthly', 'prod_test_patient', 'patient', true, 'usd', 1299, 'month', 1, 15, 
 '{"name": "Plan Mensual", "description": "Acceso completo + Chat IA personalizado", "popular": true}');

-- Insert test prices for nutritionists (no trial)
INSERT INTO prices (id, product_id, user_type, active, currency, unit_amount, interval, interval_count, metadata) VALUES
('price_test_nutritionist_pro', 'prod_test_nutritionist_pro', 'nutritionist', true, 'usd', 2999, 'month', 1, 
 '{"name": "Plan Profesional", "description": "Pacientes ilimitados + IA avanzada", "popular": true}'),
('price_test_nutritionist_clinic', 'prod_test_nutritionist_clinic', 'nutritionist', true, 'usd', 9999, 'month', 1, 
 '{"name": "Plan Clínica", "description": "Múltiples nutricionistas + Dashboard"}'),
('price_test_nutritionist_free', 'prod_test_nutritionist_free', 'nutritionist', true, 'usd', 0, 'month', 1, 
 '{"name": "Plan Gratuito", "description": "Hasta 5 pacientes"}');

-- Insert annual plans with discount
INSERT INTO prices (id, product_id, user_type, active, currency, unit_amount, interval, interval_count, trial_period_days, metadata) VALUES
('price_test_patient_annual', 'prod_test_patient', 'patient', true, 'usd', 12999, 'year', 1, 15, 
 '{"name": "Plan Anual", "description": "2 meses gratis + Acceso completo", "tier": "annual"}'),
('price_test_nutritionist_pro_annual', 'prod_test_nutritionist_pro', 'nutritionist', true, 'usd', 29999, 'year', 1, 
 '{"name": "Plan Profesional Anual", "description": "2 meses gratis + Pacientes ilimitados", "tier": "annual"}');

-- Check inserted data
SELECT * FROM prices WHERE id LIKE 'price_test_%' ORDER BY user_type, unit_amount; 