-- Create a function to hash the password and insert admin user
CREATE OR REPLACE FUNCTION public.create_admin_user(admin_email TEXT, admin_password TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  password_hash TEXT;
BEGIN
  -- Generate bcrypt hash (using salt rounds 10)
  password_hash := crypt(admin_password, gen_salt('bf', 10));
  
  -- Insert or update admin user
  INSERT INTO public.admin_users (email, password_hash)
  VALUES (admin_email, password_hash)
  ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    updated_at = now();
END;
$$;

-- Call the function to create admin user
SELECT public.create_admin_user('de_realjay@yahoo.com', 'jaezAT2013');

-- Drop the function as it's no longer needed
DROP FUNCTION public.create_admin_user(TEXT, TEXT);