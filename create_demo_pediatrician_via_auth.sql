-- Create Demo Pediatrician User via Supabase Auth
-- This is the RECOMMENDED approach if you have Supabase Auth enabled
-- 
-- Step 1: Create user via Supabase Dashboard or Auth API
-- Go to: Authentication > Users > Add User
-- Email: dr.smith@kiddyguard.demo
-- Password: (set any password)
-- Copy the User ID that gets created
--
-- Step 2: Run this SQL with the User ID from Step 1
-- Replace 'YOUR_USER_ID_FROM_AUTH' with the actual UUID

-- Option A: If you have the auth user ID
-- INSERT INTO profiles (id, username, role, family_id, wallet_address)
-- VALUES (
--   'YOUR_USER_ID_FROM_AUTH',  -- Replace with actual UUID from auth.users
--   'Dr. Smith',
--   'pediatrician',
--   gen_random_uuid(),
--   NULL
-- );

-- Option B: Use Supabase Management API (if you have access)
-- This requires using the Supabase client with service role key
-- You would do this programmatically, not via SQL

-- Option C: Simple workaround - Check what IDs exist and use a pattern
-- First, let's see what user IDs exist:
SELECT id, username, role 
FROM profiles 
ORDER BY created_at 
LIMIT 5;

-- Then manually create the profile using a similar ID pattern
-- Or use the Supabase Dashboard to create the auth user first

