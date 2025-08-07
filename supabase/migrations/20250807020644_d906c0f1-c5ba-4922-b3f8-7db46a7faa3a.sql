-- Create a security definer function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.email = (
      SELECT auth.users.email 
      FROM auth.users 
      WHERE auth.users.id = auth.uid()
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop existing policy and recreate with the function
DROP POLICY IF EXISTS "Admins can manage quiz questions" ON public.quiz_questions;

-- Create new policy using the security definer function
CREATE POLICY "Admins can manage quiz questions" 
ON public.quiz_questions 
FOR ALL 
USING (public.is_current_user_admin()) 
WITH CHECK (public.is_current_user_admin());