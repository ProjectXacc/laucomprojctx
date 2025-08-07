-- Fix the RLS policy for quiz_questions to properly check admin status
DROP POLICY IF EXISTS "Admins can manage quiz questions" ON public.quiz_questions;

-- Create a more robust admin check policy
CREATE POLICY "Admins can manage quiz questions" 
ON public.quiz_questions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.email = (
      SELECT auth.users.email 
      FROM auth.users 
      WHERE auth.users.id = auth.uid()
    )
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.email = (
      SELECT auth.users.email 
      FROM auth.users 
      WHERE auth.users.id = auth.uid()
    )
  )
);