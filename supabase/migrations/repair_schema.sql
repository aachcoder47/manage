-- Comprehensive Schema Repair Script
-- Run this entire script in the Supabase SQL Editor

DO $$
BEGIN
    -- 1. Ensure contract table has job_application_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contract' AND column_name = 'job_application_id') THEN
        ALTER TABLE contract ADD COLUMN job_application_id TEXT REFERENCES job_application(id);
    END IF;

    -- 2. Ensure work_trial table has job_application_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'work_trial' AND column_name = 'job_application_id') THEN
        ALTER TABLE work_trial ADD COLUMN job_application_id TEXT REFERENCES job_application(id);
    END IF;

    -- 3. Ensure job_application table has email
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_application' AND column_name = 'email') THEN
        ALTER TABLE job_application ADD COLUMN email TEXT;
    END IF;

    -- 4. Ensure job_application table has phone
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_application' AND column_name = 'phone') THEN
        ALTER TABLE job_application ADD COLUMN phone TEXT;
    END IF;

END $$;

-- Create indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_contract_job_application_id ON contract(job_application_id);
CREATE INDEX IF NOT EXISTS idx_work_trial_job_application_id ON work_trial(job_application_id);
