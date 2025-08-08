-- Enforce a single active-like subscription per user (active/trialing/past_due/incomplete)
DO $$
BEGIN
  -- Partial unique index across user_id where status in the set
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' AND indexname = 'uniq_active_subscription_per_user'
  ) THEN
    CREATE UNIQUE INDEX uniq_active_subscription_per_user
    ON public.subscriptions(user_id)
    WHERE status IN ('active', 'trialing', 'past_due', 'incomplete');
  END IF;
END $$;

-- Optional: helper view for the latest subscription per user
CREATE OR REPLACE VIEW public.user_latest_subscription AS
SELECT DISTINCT ON (user_id)
  user_id,
  id,
  user_type,
  stripe_customer_id,
  stripe_subscription_id,
  status,
  price_id,
  current_period_start,
  current_period_end,
  trial_start,
  trial_end,
  cancel_at_period_end,
  canceled_at,
  created_at,
  updated_at
FROM public.subscriptions
ORDER BY user_id, updated_at DESC, created_at DESC;


