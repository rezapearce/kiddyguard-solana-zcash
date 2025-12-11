-- Fix RLS policies for screening tables to work without Supabase Auth
-- Since the app uses custom authentication (not Supabase Auth), auth.uid() is null
-- This script provides alternative RLS policies that validate family_id exists in profiles

-- Drop existing policies
DROP POLICY IF EXISTS "Families can view their own screening sessions" ON screening_sessions;
DROP POLICY IF EXISTS "Families can insert their own screening sessions" ON screening_sessions;
DROP POLICY IF EXISTS "Families can update their own screening sessions" ON screening_sessions;
DROP POLICY IF EXISTS "Families can view their own screening responses" ON screening_responses;
DROP POLICY IF EXISTS "Families can insert their own screening responses" ON screening_responses;
DROP POLICY IF EXISTS "Families can view their own screening analysis" ON screening_analysis;

-- Option 1: Allow all operations if family_id exists in profiles (less secure but works without auth)
-- This is suitable for development or if you're using service role key in server actions
CREATE POLICY "Allow screening sessions for valid families"
ON screening_sessions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.family_id = screening_sessions.family_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.family_id = screening_sessions.family_id
  )
);

CREATE POLICY "Allow screening responses for valid sessions"
ON screening_responses
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM screening_sessions
    JOIN profiles ON profiles.family_id = screening_sessions.family_id
    WHERE screening_sessions.session_id = screening_responses.session_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM screening_sessions
    JOIN profiles ON profiles.family_id = screening_sessions.family_id
    WHERE screening_sessions.session_id = screening_responses.session_id
  )
);

CREATE POLICY "Allow screening analysis for valid sessions"
ON screening_analysis
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM screening_sessions
    JOIN profiles ON profiles.family_id = screening_sessions.family_id
    WHERE screening_sessions.session_id = screening_analysis.session_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM screening_sessions
    JOIN profiles ON profiles.family_id = screening_sessions.family_id
    WHERE screening_sessions.session_id = screening_analysis.session_id
  )
);
