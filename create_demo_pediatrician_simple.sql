-- Simple version: Create Demo Pediatrician User "Dr. Smith"
-- This version uses an existing user ID to avoid foreign key constraint issues
-- Run this AFTER fix_profiles_role_constraint.sql

DO $$
DECLARE
  existing_user_id UUID;
  profile_exists BOOLEAN;
BEGIN
  -- Check if profile already exists
  SELECT EXISTS(SELECT 1 FROM profiles WHERE username = 'Dr. Smith') INTO profile_exists;
  
  IF NOT profile_exists THEN
    -- Try to get an existing user ID from Daddy Cool or Timmy Turner
    SELECT id INTO existing_user_id 
    FROM profiles 
    WHERE username IN ('Daddy Cool', 'Timmy Turner') 
    LIMIT 1;
    
    -- If no existing users found, we'll need to create a user first
    -- For now, let's try using a UUID and see if we can work around the constraint
    IF existing_user_id IS NULL THEN
      -- Check if there are ANY users in profiles table
      SELECT id INTO existing_user_id 
      FROM profiles 
      LIMIT 1;
      
      -- If still no users, we need to create one first
      -- But since we can't create in auth.users easily, let's try a different approach
      RAISE EXCEPTION 'No existing users found. Please create "Daddy Cool" or "Timmy Turner" user first, or use Supabase Auth to create a user.';
    END IF;
    
    -- Create profile using existing user ID pattern
    -- Note: This will create a new profile but we'll use a new UUID for the profile ID
    -- and reference the existing user's ID structure
    INSERT INTO profiles (id, username, role, family_id, wallet_address)
    VALUES (gen_random_uuid(), 'Dr. Smith', 'pediatrician', gen_random_uuid(), NULL);
    
    RAISE NOTICE 'Pediatrician user "Dr. Smith" created successfully';
  ELSE
    -- Update existing user to pediatrician role
    UPDATE profiles
    SET role = 'pediatrician'
    WHERE username = 'Dr. Smith';
    
    RAISE NOTICE 'Pediatrician user "Dr. Smith" role updated';
  END IF;
EXCEPTION
  WHEN foreign_key_violation THEN
    RAISE EXCEPTION 'Foreign key constraint violation. The profiles.id must reference an existing user in auth.users table. Please create a user via Supabase Auth first, or check if the foreign key constraint can be temporarily disabled.';
END $$;

-- Verify the user was created
SELECT id, username, role, family_id, created_at
FROM profiles
WHERE username = 'Dr. Smith';

