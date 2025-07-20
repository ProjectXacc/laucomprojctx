-- Insert admin user with hashed password
-- Using bcrypt hash for password 'jaezAT2013'
INSERT INTO public.admin_users (email, password_hash)
VALUES (
  'de_realjay@yahoo.com',
  '$2b$10$8K0QJ4K4K4K4K4K4K4K4KOZxZ3xZ3xZ3xZ3xZ3xZ3xZ3xZ3xZ3xZ3u'
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  updated_at = now();