-- Fix Supabase schema cache relationship issue between screenings and payment_intents
-- This ensures the foreign key relationship is properly recognized by Supabase PostgREST
-- Run this in Supabase SQL Editor

-- Step 1: Verify current foreign key constraint exists
SELECT
    'Checking foreign key constraint...' as step,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'payment_intents'
    AND kcu.column_name = 'screening_id';

-- Step 2: Ensure screening_id column exists with proper foreign key
DO $$
BEGIN
    -- Check if column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_intents' 
        AND column_name = 'screening_id'
        AND table_schema = 'public'
    ) THEN
        -- Add column with foreign key
        ALTER TABLE payment_intents
        ADD COLUMN screening_id UUID REFERENCES screenings(id) ON DELETE SET NULL;
        
        RAISE NOTICE 'Added screening_id column with foreign key constraint';
    ELSE
        -- Check if foreign key exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
                ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'payment_intents' 
              AND kcu.column_name = 'screening_id'
              AND tc.constraint_type = 'FOREIGN KEY'
              AND tc.table_schema = 'public'
        ) THEN
            -- Add foreign key constraint to existing column
            ALTER TABLE payment_intents
            ADD CONSTRAINT fk_payment_intents_screening_id 
            FOREIGN KEY (screening_id) 
            REFERENCES screenings(id) 
            ON DELETE SET NULL;
            
            RAISE NOTICE 'Added foreign key constraint to existing screening_id column';
        ELSE
            RAISE NOTICE 'Foreign key constraint already exists';
        END IF;
    END IF;
END $$;

-- Step 3: Create index for performance (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_payment_intents_screening_id 
ON payment_intents(screening_id);

-- Step 4: Verify the relationship is properly set up
SELECT
    'Final verification - Foreign key constraint:' as step,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'payment_intents'
    AND kcu.column_name = 'screening_id'
    AND tc.table_schema = 'public';

-- Step 5: Refresh Supabase schema cache
-- Note: This may require Supabase dashboard action or waiting a few minutes
-- The schema cache typically refreshes automatically, but can take 1-5 minutes

-- After running this script:
-- 1. Wait 1-5 minutes for Supabase schema cache to refresh
-- 2. If the error persists, go to Supabase Dashboard > Settings > API > Refresh Schema Cache
-- 3. Or contact Supabase support to manually refresh the schema cache

