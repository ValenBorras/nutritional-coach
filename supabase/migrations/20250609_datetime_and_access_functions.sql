-- Recreate helpers using Postgres now() directly
CREATE OR REPLACE FUNCTION public.has_active_trial(user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.patient_trials 
    WHERE user_id = user_id_param 
      AND trial_end > now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
  
  RETURN GREATEST(0, EXTRACT(DAY FROM (trial_end_date - now()))::INTEGER);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Align get_patient_trial_status with now()
CREATE OR REPLACE FUNCTION public.get_patient_trial_status(patient_id UUID)
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
  FROM public.patient_trials pt
  LEFT JOIN public.subscriptions s 
    ON (s.user_id = patient_id AND s.user_type = 'patient' AND s.status = 'active')
  WHERE pt.user_id = patient_id;
  
  IF NOT FOUND THEN
      RETURN QUERY SELECT false, false, 0, null::TIMESTAMPTZ, false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional cleanup: remove helper if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'datetime' AND pg_function_is_visible(oid)) THEN
    DROP FUNCTION public.datetime();
  END IF;
END $$;


