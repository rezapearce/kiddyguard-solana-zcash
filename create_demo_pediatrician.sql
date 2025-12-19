-- Create Demo Pediatrician User
-- Run this in Supabase SQL Editor to create the "Dr. Smith" user for pediatrician login

-- Insert pediatrician user with explicit ID generation
-- If user already exists, update the role instead
INSERT INTO profiles (id, username, role, family_id, wallet_address)
VALUES (
  gen_random_uuid(),
  'Dr. Smith',
  'pediatrician',
  gen_random_uuid(),
  NULL  -- Pediatricians don't need wallet addresses for demo
)
ON CONFLICT (username) DO UPDATE
SET role = 'pediatrician'
WHERE profiles.username = 'Dr. Smith';

-- Alternative: If ON CONFLICT doesn't work (no unique constraint on username),
-- use this approach instead:
-- 
-- DO $$
-- DECLARE
--   user_exists BOOLEAN;
-- BEGIN
--   SELECT EXISTS(SELECT 1 FROM profiles WHERE username = 'Dr. Smith') INTO user_exists;
--   
--   IF NOT user_exists THEN
--     INSERT INTO profiles (id, username, role, family_id, wallet_address)
--     VALUES (gen_random_uuid(), 'Dr. Smith', 'pediatrician', gen_random_uuid(), NULL);
--   ELSE
--     UPDATE profiles
--     SET role = 'pediatrician'
--     WHERE username = 'Dr. Smith';
--   END IF;
-- END $$;

-- Verify the user was created/updated
SELECT id, username, role, family_id, wallet_address, created_at
FROM profiles
WHERE username = 'Dr. Smith';

-- Expected output: One row with username='Dr. Smith' and role='pediatrician'

