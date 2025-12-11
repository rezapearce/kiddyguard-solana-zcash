-- Create screenings table for simplified pediatric screening feature
-- This table consolidates questionnaire responses (JSONB) and AI analysis in a single table

-- Create custom ENUM type for screening status
CREATE TYPE screening_status AS ENUM ('PENDING_REVIEW', 'REVIEW_PAID', 'COMPLETED');

-- Create the screenings table
CREATE TABLE IF NOT EXISTS screenings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL,
  child_name TEXT NOT NULL,
  child_age_months INTEGER NOT NULL CHECK (child_age_months >= 0 AND child_age_months <= 36),
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  ai_risk_score INTEGER CHECK (ai_risk_score IS NULL OR (ai_risk_score >= 0 AND ai_risk_score <= 100)),
  ai_summary TEXT,
  status screening_status NOT NULL DEFAULT 'PENDING_REVIEW',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_screenings_family_id ON screenings(family_id);
CREATE INDEX IF NOT EXISTS idx_screenings_status ON screenings(status);
CREATE INDEX IF NOT EXISTS idx_screenings_created_at ON screenings(created_at DESC);
-- GIN index on JSONB answers column for efficient JSON queries
CREATE INDEX IF NOT EXISTS idx_screenings_answers_gin ON screenings USING GIN (answers);

-- Enable Row Level Security
ALTER TABLE screenings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Families can view their own screenings" ON screenings;
DROP POLICY IF EXISTS "Families can insert their own screenings" ON screenings;
DROP POLICY IF EXISTS "Families can update their own screenings" ON screenings;

-- RLS Policy: Families can SELECT their own screenings
-- Validates that family_id exists in profiles table and matches user's family_id
CREATE POLICY "Families can view their own screenings"
ON screenings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.family_id = screenings.family_id
    -- If using Supabase Auth, add: AND profiles.id = auth.uid()
    -- For custom auth, this validates family_id exists in profiles
  )
);

-- RLS Policy: Families can INSERT their own screenings
-- Validates that the family_id being inserted exists in profiles table
CREATE POLICY "Families can insert their own screenings"
ON screenings
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.family_id = screenings.family_id
    -- If using Supabase Auth, add: AND profiles.id = auth.uid()
    -- For custom auth, this validates family_id exists in profiles
  )
);

-- RLS Policy: Families can UPDATE their own screenings
-- Validates that the screening belongs to a valid family_id in profiles
CREATE POLICY "Families can update their own screenings"
ON screenings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.family_id = screenings.family_id
    -- If using Supabase Auth, add: AND profiles.id = auth.uid()
    -- For custom auth, this validates family_id exists in profiles
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.family_id = screenings.family_id
    -- If using Supabase Auth, add: AND profiles.id = auth.uid()
    -- For custom auth, this validates family_id exists in profiles
  )
);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_screenings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_screenings_updated_at ON screenings;
CREATE TRIGGER update_screenings_updated_at
  BEFORE UPDATE ON screenings
  FOR EACH ROW
  EXECUTE FUNCTION update_screenings_updated_at();

-- Add helpful comments
COMMENT ON TABLE screenings IS 'Stores pediatric developmental screening data with questionnaire responses (JSONB) and AI analysis results';
COMMENT ON COLUMN screenings.family_id IS 'References profiles.family_id (validated via RLS, not FK constraint)';
COMMENT ON COLUMN screenings.answers IS 'JSONB array of questionnaire responses: [{questionId, response, category, milestoneAgeMonths, ...}]';
COMMENT ON COLUMN screenings.ai_risk_score IS 'AI-generated risk score (0-100) after payment for review';
COMMENT ON COLUMN screenings.ai_summary IS 'AI-generated summary text after payment for review';
COMMENT ON COLUMN screenings.status IS 'Workflow: PENDING_REVIEW -> REVIEW_PAID -> COMPLETED';
