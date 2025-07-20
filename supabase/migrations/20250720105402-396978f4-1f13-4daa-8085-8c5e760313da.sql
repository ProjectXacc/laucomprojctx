-- Add trial support to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS trial_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_trial BOOLEAN DEFAULT false;

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
    'active',
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
DROP TRIGGER IF EXISTS on_auth_user_created_grant_trial ON auth.users;
CREATE TRIGGER on_auth_user_created_grant_trial
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.grant_trial_to_new_user();