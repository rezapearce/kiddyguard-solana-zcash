-- Create Demo Pediatrician User
-- Run this in Supabase SQL Editor to create the "Dr. Smith" user for pediatrician login

-- Insert pediatrician user if it doesn't exist
INSERT INTO profiles (username, role, family_id)
VALUES ('Dr. Smith', 'pediatrician', gen_random_uuid())
ON CONFLICT (username) DO UPDATE
SET role = 'pediatrician'
WHERE profiles.username = 'Dr. Smith';

-- Verify the user was created
SELECT id, username, role, family_id, created_at
FROM profiles
WHERE username = 'Dr. Smith';

-- Note: If you get a conflict error, the user might already exist with a different role
-- The ON CONFLICT clause will update the role to 'pediatrician' if needed

