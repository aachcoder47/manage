-- Create the missing tables if they don't exist
-- This script creates all necessary tables for the job posting system

-- Create jobs table if it doesn't exist
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    organization_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT NULL,
    location VARCHAR(255) NULL,
    employment_type VARCHAR(50) NULL,
    salary_range VARCHAR(255) NULL,
    is_remote BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'closed', 'draft'
    views INTEGER DEFAULT 0
);

-- Create job_applications table if it doesn't exist
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    job_id UUID NOT NULL,
    candidate_name VARCHAR(255) NOT NULL,
    candidate_email VARCHAR(255) NOT NULL,
    candidate_phone VARCHAR(50) NULL,
    resume_url VARCHAR(500) NULL,
    cover_letter TEXT NULL,
    source VARCHAR(50) NULL, -- 'linkedin', 'indeed', 'naukri', 'direct'
    external_application_id VARCHAR(255) NULL,
    status VARCHAR(20) DEFAULT 'new' -- 'new', 'reviewing', 'shortlisted', 'rejected', 'hired'
);

-- Create interviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    job_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    interviewer_id VARCHAR(255) NULL,
    url VARCHAR(500) NULL,
    readable_slug VARCHAR(255) NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_organization_id ON jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_interviews_job_id ON interviews(job_id);

-- Add foreign key constraints if tables exist
DO $$
BEGIN
    -- Add foreign key for job_applications
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jobs' AND table_schema = 'public') AND
       EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'job_applications' AND table_schema = 'public') THEN
        ALTER TABLE job_applications 
        ADD CONSTRAINT fk_job_applications_job_id 
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
    END IF;
    
    -- Add foreign key for interviews
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jobs' AND table_schema = 'public') AND
       EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'interviews' AND table_schema = 'public') THEN
        ALTER TABLE interviews 
        ADD CONSTRAINT fk_interviews_job_id 
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Verify table creation
SELECT 
    table_name, 
    table_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public')
        THEN (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public')
        ELSE 0
    END as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('jobs', 'job_applications', 'interviews', 'external_job_posting', 'job_board_integrations')
ORDER BY table_name;
