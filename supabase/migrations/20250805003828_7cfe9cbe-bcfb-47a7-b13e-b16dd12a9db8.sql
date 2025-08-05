-- Fix security warning: Set search_path for the function
CREATE OR REPLACE FUNCTION public.authenticate_admin(admin_email TEXT, admin_password TEXT)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  temp_password TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_record RECORD;
  is_valid_password BOOLEAN;
  temp_pass TEXT;
BEGIN
  -- Check if admin exists
  SELECT * INTO admin_record
  FROM admin_users
  WHERE email = admin_email;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Invalid admin credentials'::TEXT, ''::TEXT;
    RETURN;
  END IF;
  
  -- Verify password (using extensions.crypt for bcrypt comparison)
  SELECT admin_record.password_hash = crypt(admin_password, admin_record.password_hash) INTO is_valid_password;
  
  IF NOT is_valid_password THEN
    RETURN QUERY SELECT FALSE, 'Invalid admin credentials'::TEXT, ''::TEXT;
    RETURN;
  END IF;
  
  -- Generate temporary password for session
  temp_pass := 'admin_temp_' || extract(epoch from now())::text;
  
  RETURN QUERY SELECT TRUE, 'Authentication successful'::TEXT, temp_pass;
END;
$$;