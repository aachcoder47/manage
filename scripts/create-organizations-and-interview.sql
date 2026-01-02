-- Create missing organizations table and fix the interview application
-- This will create the organizations table and then the interview application

-- Step 1: Create organizations table if it doesn't exist
CREATE TABLE IF NOT EXISTS organizations (
    id VARCHAR(255) PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name VARCHAR(255) NOT NULL,
    image_url VARCHAR(500) NULL,
    website VARCHAR(500) NULL,
    description TEXT NULL,
    industry VARCHAR(100) NULL,
    size VARCHAR(50) NULL,
    location VARCHAR(255) NULL,
    logo_url VARCHAR(500) NULL,
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true
);

-- Step 2: Create the organization that's referenced in the interview application
INSERT INTO organizations (
    id,
    created_at,
    updated_at,
    name,
    image_url,
    website,
    description,
    industry,
    size,
    location,
    logo_url,
    metadata,
    is_active
) VALUES (
    'org_364aEa8oLmqpjqZhuWm7sdaqSQz',
    NOW(),
    NOW(),
    'Interview Test Organization',
    'https://example.com/logo.png',
    'https://example.com',
    'Test organization for interview process debugging',
    'Technology',
    'Small',
    'Bangalore, India',
    'https://example.com/logo.png',
    '{"test": true, "created_for_interview": true}',
    true
);

-- Step 3: Verify organization was created
SELECT 
    'Organization Verification' as step,
    id,
    name,
    industry,
    size,
    location,
    created_at
FROM organizations 
WHERE id = 'org_364aEa8oLmqpjqZhuWm7sdaqSQz';

-- Step 4: Check if we have any jobs to reference
SELECT 
    'Jobs Check for Interview Application' as step,
    COUNT(*) as total_jobs,
    MIN(id::TEXT) as first_job_id,
    MIN(title) as first_job_title,
    MIN(organization_id) as first_job_org
FROM jobs;

-- Step 5: Create a test job if none exists (linked to the organization)
INSERT INTO jobs (
    id,
    created_at,
    updated_at,
    organization_id,
    title,
    description,
    requirements,
    location,
    employment_type,
    salary_range,
    is_remote,
    status,
    views,
    company_name,
    company_description
) VALUES (
    gen_random_uuid(),
    NOW(),
    NOW(),
    'org_364aEa8oLmqpjqZhuWm7sdaqSQz',
    'Senior Software Engineer - Interview Test',
    'We are looking for a talented Senior Software Engineer to join our dynamic team. This is a test position for interview process debugging.',
    '5+ years of experience in software development, strong problem-solving skills, experience with modern web technologies.',
    'Bangalore, Karnataka',
    'full-time',
    '₹15,00,000 - ₹25,00,000 per annum',
    true,
    'open',
    0,
    'Interview Test Organization',
    'Leading technology company focused on innovation and growth.'
);

-- Step 6: Get the job ID for the interview application
DO $$
DECLARE
    job_record RECORD;
BEGIN
    SELECT id, title INTO job_record FROM jobs WHERE organization_id = 'org_364aEa8oLmqpjqZhuWm7sdaqSQz' LIMIT 1;
    
    IF job_record IS NOT NULL THEN
        -- Step 7: Create the interview application
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
            'd5167e49-7215-4cea-8bd9-8e24293b6dab',
            NOW(),
            NOW(),
            job_record.id,
            'user_364WebGvJNOCngdeyz4qTP7wXXA',
            'org_364aEa8oLmqpjqZhuWm7sdaqSQz',
            NULL,
            'direct',
            'direct_app_' || gen_random_uuid(),
            'Interview Candidate',
            'interview.candidate@example.com',
            '+91-9876543210',
            'https://www.linkedin.com/in/interviewcandidate',
            'https://example.com/resumes/interview_candidate_resume.pdf',
            'I am very interested in this position and believe my skills align perfectly with your requirements. I have extensive experience in software development and would love to contribute to your team. Looking forward to the interview process.',
            'pending',
            'direct',
            NOW(),
            NOW(),
            'Application created for interview process testing',
            '{"test": true, "created_for_interview": true, "debugging_purpose": "interview_screening_404_error"}',
            true
        );
        
        RAISE NOTICE 'Created interview application for job: %', job_record.title;
    ELSE
        RAISE NOTICE 'No job found for organization, creating application without job link';
        
        -- Create application without job link
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
            'd5167e49-7215-4cea-8bd9-8e24293b6dab',
            NOW(),
            NOW(),
            'test-job-id',
            'user_364WebGvJNOCngdeyz4qTP7wXXA',
            'org_364aEa8oLmqpjqZhuWm7sdaqSQz',
            NULL,
            'direct',
            'direct_app_' || gen_random_uuid(),
            'Interview Candidate',
            'interview.candidate@example.com',
            '+91-9876543210',
            'https://www.linkedin.com/in/interviewcandidate',
            'https://example.com/resumes/interview_candidate_resume.pdf',
            'I am very interested in this position and believe my skills align perfectly with your requirements. I have extensive experience in software development and would love to contribute to your team. Looking forward to the interview process.',
            'pending',
            'direct',
            NOW(),
            NOW(),
            'Application created for interview process testing (no job link)',
            '{"test": true, "created_for_interview": true, "debugging_purpose": "interview_screening_404_error"}',
            true
        );
    END IF;
END $$;

-- Step 8: Verify the interview application was created
SELECT 
    'Interview Application Verification' as step,
    ja.id,
    ja.applicant_name,
    ja.applicant_email,
    ja.platform,
    ja.application_status,
    ja.organization_id,
    ja.job_id,
    j.title as job_title,
    o.name as organization_name,
    ja.created_at,
    ja.metadata
FROM job_applications ja
LEFT JOIN jobs j ON ja.job_id = j.id
LEFT JOIN organizations o ON ja.organization_id = o.id
WHERE ja.id = 'd5167e49-7215-4cea-8bd9-8e24293b6dab';

-- Step 9: Create initial AI screening record for this application
INSERT INTO ai_screening (
    id,
    created_at,
    updated_at,
    application_id,
    screening_status,
    screening_result,
    screening_score,
    screening_reason,
    screening_model,
    screening_version,
    error_message,
    error_code,
    retry_count,
    max_retries,
    metadata,
    is_active
) VALUES (
    gen_random_uuid(),
    NOW(),
    NOW(),
    'd5167e49-7215-4cea-8bd9-8e24293b6dab',
    'pending',
    '{"initial": true, "interview_candidate": true}',
    0.00,
    'Initial screening record created for interview candidate',
    'mistral-7b',
    '1.0',
    NULL,
    NULL,
    0,
    3,
    '{"test": true, "created_for_interview": true, "candidate_type": "interview"}',
    true
);

-- Step 10: Verify screening record
SELECT 
    'Interview Screening Verification' as step,
    id as screening_id,
    application_id,
    screening_status,
    screening_score,
    screening_reason,
    created_at
FROM ai_screening 
WHERE application_id = 'd5167e49-7215-4cea-8bd9-8e24293b6dab';

-- Step 11: Check all applications that exist now
SELECT 
    'All Applications Summary' as step,
    COUNT(*) as total_applications,
    COUNT(DISTINCT platform) as platforms_used,
    COUNT(DISTINCT organization_id) as organizations,
    STRING_AGG(DISTINCT ja.id::TEXT, ', ') as application_ids
FROM job_applications ja
WHERE ja.id IN ('f4e3b35a-6df3-4a76-bbcc-135354800a8d', 'd5167e49-7215-4cea-8bd9-8e24293b6dab');
