-- Políticas RLS más seguras para webhooks

-- Política para permitir inserción en subscriptions desde webhooks (service role)
CREATE POLICY "Allow webhook subscription creation" ON subscriptions
    FOR INSERT 
    TO service_role
    WITH CHECK (true);

-- Política para permitir actualización en subscriptions desde webhooks (service role)  
CREATE POLICY "Allow webhook subscription updates" ON subscriptions
    FOR UPDATE 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Política para permitir inserción en patient_trials desde webhooks (service role)
CREATE POLICY "Allow webhook trial creation" ON patient_trials
    FOR INSERT 
    TO service_role
    WITH CHECK (true);

-- Política para permitir actualización en patient_trials desde webhooks (service role)
CREATE POLICY "Allow webhook trial updates" ON patient_trials
    FOR UPDATE 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Política para permitir lectura de subscriptions desde webhooks (service role)
CREATE POLICY "Allow webhook subscription reads" ON subscriptions
    FOR SELECT 
    TO service_role
    USING (true);

-- Política para permitir lectura de patient_trials desde webhooks (service role)
CREATE POLICY "Allow webhook trial reads" ON patient_trials
    FOR SELECT 
    TO service_role
    USING (true); 