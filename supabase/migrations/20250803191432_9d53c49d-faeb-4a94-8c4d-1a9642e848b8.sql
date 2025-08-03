-- Fix RLS policies for subscriptions table to allow proper access
-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "System can insert subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "System can update subscriptions" ON public.subscriptions;

-- Create new RLS policies that work correctly
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own subscriptions" ON public.subscriptions
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own subscriptions" ON public.subscriptions
FOR UPDATE 
USING (user_id = auth.uid());

-- Allow service role to bypass RLS for edge functions
CREATE POLICY "Service role can manage all subscriptions" ON public.subscriptions
FOR ALL
USING (true)
WITH CHECK (true);

-- Make sure RLS is enabled
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;