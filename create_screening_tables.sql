-- Create screening_sessions table
CREATE TABLE IF NOT EXISTS screening_sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL,
  child_name TEXT NOT NULL,
  child_age_months INTEGER NOT NULL,
  age_group TEXT NOT NULL, -- e.g., '0-3', '3-6', '6-9', etc.
  status TEXT NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'PAYMENT_PENDING', 'PAID')),
  payment_intent_id UUID REFERENCES payment_intents(intent_id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create screening_responses table
CREATE TABLE IF NOT EXISTS screening_responses (
  response_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES screening_sessions(session_id) ON DELETE CASCADE,
  question_id TEXT NOT NULL, -- e.g., 'gross_motor_1', 'fine_motor_2'
  question_text TEXT NOT NULL,
  category TEXT NOT NULL, -- 'gross_motor', 'fine_motor', 'language', 'personal_social'
  response_value TEXT NOT NULL, -- 'yes', 'no', 'sometimes', 'not_applicable'
  milestone_age_months INTEGER, -- Age when milestone should be achieved
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create screening_analysis table
CREATE TABLE IF NOT EXISTS screening_analysis (
  analysis_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES screening_sessions(session_id) ON DELETE CASCADE,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MODERATE', 'HIGH')),
  risk_score NUMERIC(5, 2), -- 0.00 to 100.00
  summary TEXT NOT NULL,
  recommendations TEXT, -- JSON array of recommendation strings
  ai_model TEXT NOT NULL DEFAULT 'llama-3',
  ai_provider TEXT NOT NULL DEFAULT 'groq',
  raw_response JSONB, -- Store full AI response for debugging
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_screening_sessions_family_id ON screening_sessions(family_id);
CREATE INDEX IF NOT EXISTS idx_screening_sessions_status ON screening_sessions(status);
CREATE INDEX IF NOT EXISTS idx_screening_responses_session_id ON screening_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_screening_analysis_session_id ON screening_analysis(session_id);

-- Enable Row Level Security
ALTER TABLE screening_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE screening_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE screening_analysis ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Families can view their own screening sessions" ON screening_sessions;
DROP POLICY IF EXISTS "Families can insert their own screening sessions" ON screening_sessions;
DROP POLICY IF EXISTS "Families can update their own screening sessions" ON screening_sessions;
DROP POLICY IF EXISTS "Families can view their own screening responses" ON screening_responses;
DROP POLICY IF EXISTS "Families can insert their own screening responses" ON screening_responses;
DROP POLICY IF EXISTS "Families can view their own screening analysis" ON screening_analysis;

-- RLS Policy: Families can only SELECT their own screening sessions
CREATE POLICY "Families can view their own screening sessions"
ON screening_sessions
FOR SELECT
USING (family_id = (SELECT family_id FROM profiles WHERE id = auth.uid()));

-- RLS Policy: Families can INSERT their own screening sessions
CREATE POLICY "Families can insert their own screening sessions"
ON screening_sessions
FOR INSERT
WITH CHECK (family_id = (SELECT family_id FROM profiles WHERE id = auth.uid()));

-- RLS Policy: Families can UPDATE their own screening sessions
CREATE POLICY "Families can update their own screening sessions"
ON screening_sessions
FOR UPDATE
USING (family_id = (SELECT family_id FROM profiles WHERE id = auth.uid()));

-- RLS Policy: Families can view their own screening responses
CREATE POLICY "Families can view their own screening responses"
ON screening_responses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM screening_sessions
    WHERE screening_sessions.session_id = screening_responses.session_id
    AND screening_sessions.family_id = (SELECT family_id FROM profiles WHERE id = auth.uid())
  )
);

-- RLS Policy: Families can insert their own screening responses
CREATE POLICY "Families can insert their own screening responses"
ON screening_responses
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM screening_sessions
    WHERE screening_sessions.session_id = screening_responses.session_id
    AND screening_sessions.family_id = (SELECT family_id FROM profiles WHERE id = auth.uid())
  )
);

-- RLS Policy: Families can view their own screening analysis
CREATE POLICY "Families can view their own screening analysis"
ON screening_analysis
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM screening_sessions
    WHERE screening_sessions.session_id = screening_analysis.session_id
    AND screening_sessions.family_id = (SELECT family_id FROM profiles WHERE id = auth.uid())
  )
);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_screening_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_screening_sessions_updated_at ON screening_sessions;
CREATE TRIGGER update_screening_sessions_updated_at
  BEFORE UPDATE ON screening_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_screening_sessions_updated_at();
