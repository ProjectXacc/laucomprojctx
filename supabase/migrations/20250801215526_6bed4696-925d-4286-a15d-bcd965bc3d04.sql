-- Fix the RLS policies that are causing "permission denied for table users" errors
-- The issue is referencing auth.users incorrectly in the admin policies

-- Drop existing admin policies and recreate them with correct syntax
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can manage quiz questions" ON public.quiz_questions;

-- Recreate subscription admin policy with correct auth.users reference
CREATE POLICY "Admins can view all subscriptions" 
ON public.subscriptions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 
    FROM admin_users 
    WHERE admin_users.email = (
      SELECT auth.users.email 
      FROM auth.users 
      WHERE auth.users.id = auth.uid()
    )
  )
);

-- Recreate quiz questions admin policy with correct auth.users reference  
CREATE POLICY "Admins can manage quiz questions" 
ON public.quiz_questions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 
    FROM admin_users 
    WHERE admin_users.email = (
      SELECT auth.users.email 
      FROM auth.users 
      WHERE auth.users.id = auth.uid()
    )
  )
);