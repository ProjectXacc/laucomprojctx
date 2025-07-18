-- Add trial support to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN trial_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN is_trial BOOLEAN DEFAULT false;

-- Update subscription_status to include trial
ALTER TYPE subscription_status_enum RENAME TO subscription_status_enum_old;
CREATE TYPE subscription_status_enum AS ENUM ('active', 'expired', 'trial', 'none');
ALTER TABLE public.subscriptions ALTER COLUMN subscription_status TYPE subscription_status_enum USING subscription_status::text::subscription_status_enum;
DROP TYPE subscription_status_enum_old;

-- Create function to grant trial to new users
CREATE OR REPLACE FUNCTION public.grant_trial_to_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Grant 3-day trial to new users
  INSERT INTO public.subscriptions (
    user_id,
    subscription_status,
    is_trial,
    trial_end,
    subscription_start,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    'trial',
    true,
    NOW() + INTERVAL '3 days',
    NOW(),
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically grant trial on user creation
CREATE TRIGGER on_auth_user_created_grant_trial
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.grant_trial_to_new_user();