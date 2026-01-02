-- Create job applications tracking system
-- This will create tables for tracking job applications from all platforms

-- Step 1: Create job_applications table
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    job_id UUID NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    organization_id VARCHAR(255) NULL,
    external_posting_id UUID NULL,
    platform VARCHAR(50) NOT NULL, -- 'linkedin', 'indeed', 'naukri', 'direct'
    platform_application_id VARCHAR(255) NULL, -- External platform application ID
    applicant_name VARCHAR(255) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    applicant_phone VARCHAR(50) NULL,
    applicant_linkedin VARCHAR(500) NULL,
    resume_url VARCHAR(500) NULL,
    cover_letter TEXT NULL,
    application_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewing', 'shortlisted', 'rejected', 'hired'
    application_source VARCHAR(50) DEFAULT 'external', -- 'external', 'direct', 'internal'
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_status_change_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT NULL,
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true
);

-- Step 2: Create application_status_history table
CREATE TABLE IF NOT EXISTS application_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    application_id UUID NOT NULL,
    old_status VARCHAR(20) NULL,
    new_status VARCHAR(20) NOT NULL,
    changed_by VARCHAR(255) NULL,
    change_reason TEXT NULL,
    notes TEXT NULL
);

-- Step 3: Create application_communications table
CREATE TABLE IF NOT EXISTS application_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    application_id UUID NOT NULL,
    communication_type VARCHAR(50) NOT NULL, -- 'email', 'phone', 'linkedin', 'sms'
    communication_direction VARCHAR(20) NOT NULL, -- 'sent', 'received'
    subject VARCHAR(255) NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_platform ON job_applications(platform);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_job_applications_applied_at ON job_applications(applied_at);
CREATE INDEX IF NOT EXISTS idx_job_applications_email ON job_applications(applicant_email);
CREATE INDEX IF NOT EXISTS idx_application_status_history_application_id ON application_status_history(application_id);
CREATE INDEX IF NOT EXISTS idx_application_communications_application_id ON application_communications(application_id);

-- Step 5: Add foreign key constraints
ALTER TABLE job_applications 
ADD CONSTRAINT fk_job_applications_job_id 
FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;

ALTER TABLE job_applications 
ADD CONSTRAINT fk_job_applications_external_posting 
FOREIGN KEY (external_posting_id) REFERENCES external_job_posting(id) ON DELETE SET NULL;

ALTER TABLE application_status_history 
ADD CONSTRAINT fk_application_status_history_application_id 
FOREIGN KEY (application_id) REFERENCES job_applications(id) ON DELETE CASCADE;

ALTER TABLE application_communications 
ADD CONSTRAINT fk_application_communications_application_id 
FOREIGN KEY (application_id) REFERENCES job_applications(id) ON DELETE CASCADE;

-- Step 6: Create sample job applications for testing
DO $$
BEGIN
    -- Check if we have jobs first
    IF EXISTS (SELECT 1 FROM jobs LIMIT 1) THEN
        -- Create sample applications for each job
        FOR job_record IN SELECT id, title FROM jobs LIMIT 3 LOOP
            -- Create sample application
            INSERT INTO job_applications (
                id,
                created_at,
                updated_at,
                job_id,
                user_id,
                organization_id,
                external_posting_id,
                platform,
                platform_application_id,
                applicant_name,
                applicant_email,
                applicant_phone,
                applicant_linkedin,
                resume_url,
                cover_letter,
                application_status,
                application_source,
                applied_at,
                last_status_change_at,
                notes,
                metadata,
                is_active
            ) VALUES (
                gen_random_uuid(),
                NOW(),
                NOW(),
                job_record.id,
                'user_test_123',
                'org_35yQtFg3zHUHOYvunaXt5bxdzxb',
                (SELECT id FROM external_job_posting WHERE job_id = job_record.id LIMIT 1),
                'linkedin',
                'linkedin_app_' || gen_random_uuid(),
                'John Doe',
                'john.doe@example.com',
                '+91-9876543210',
                'https://www.linkedin.com/in/johndoe',
                'https://example.com/resumes/john_doe_resume.pdf',
                'I am very interested in this position and believe my skills align perfectly with your requirements.',
                'pending',
                'external',
                NOW() - INTERVAL '2 days',
                NOW(),
                'Applied via LinkedIn post',
                '{"source": "linkedin", "experience_years": 5}',
                true
            );
            
            -- Create another sample application
            INSERT INTO job_applications (
                id,
                created_at,
                updated_at,
                job_id,
                user_id,
                organization_id,
                external_posting_id,
                platform,
                platform_application_id,
                applicant_name,
                applicant_email,
                applicant_phone,
                applicant_linkedin,
                resume_url,
                cover_letter,
                application_status,
                application_source,
                applied_at,
                last_status_change_at,
                notes,
                metadata,
                is_active
            ) VALUES (
                gen_random_uuid(),
                NOW(),
                NOW(),
                job_record.id,
                'user_test_123',
                'org_35yQtFg3zHUHOYvunaXt5bxdzxb',
                (SELECT id FROM external_job_posting WHERE job_id = job_record.id LIMIT 1),
                'direct',
                'direct_app_' || gen_random_uuid(),
                'Jane Smith',
                'jane.smith@example.com',
                '+91-9876543211',
                'https://www.linkedin.com/in/janesmith',
                'https://example.com/resumes/jane_smith_resume.pdf',
                'I have extensive experience in this field and would love to contribute to your team.',
                'reviewing',
                'direct',
                NOW() - INTERVAL '1 day',
                NOW(),
                'Applied directly through our platform',
                '{"source": "direct", "experience_years": 7}',
                true
            );
        END LOOP;
        
        RAISE NOTICE 'Created sample job applications';
    ELSE
        RAISE NOTICE 'No jobs found to create applications for';
    END IF;
END $$;

-- Step 7: Verify application creation
SELECT 
    'Job Applications Verification' as step,
    COUNT(*) as total_applications,
    COUNT(DISTINCT job_id) as jobs_with_applications,
    COUNT(DISTINCT platform) as platforms_used
FROM job_applications;

-- Step 8: Show sample applications
SELECT 
    'Sample Applications' as step,
    ja.applicant_name,
    ja.applicant_email,
    ja.platform,
    ja.application_status,
    ja.applied_at,
    j.title as job_title
FROM job_applications ja
JOIN jobs j ON ja.job_id = j.id
ORDER BY ja.applied_at DESC
LIMIT 5;
