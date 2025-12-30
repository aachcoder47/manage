-- Fix missing columns in contract and work_trial tables
-- These are necessary for linking contracts/trials to specific job applications

ALTER TABLE contract ADD COLUMN IF NOT EXISTS job_application_id TEXT REFERENCES job_application(id);
ALTER TABLE work_trial ADD COLUMN IF NOT EXISTS job_application_id TEXT REFERENCES job_application(id);

-- Add foreign key indexes if they don't exist (good practice)
CREATE INDEX IF NOT EXISTS idx_contract_job_application_id ON contract(job_application_id);
CREATE INDEX IF NOT EXISTS idx_work_trial_job_application_id ON work_trial(job_application_id);
