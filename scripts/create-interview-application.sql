-- Create the missing application that's causing the 404 error
-- This will ensure the application d5167e49-7215-4cea-8bd9-8e24293b6dab exists

-- Step 1: Check if we have any jobs to reference
SELECT 
    'Jobs Check for New Application' as step,
    COUNT(*) as total_jobs,
    MIN(id) as first_job_id,
    MIN(title) as first_job_title
FROM jobs;

-- Step 2: Create the specific application that's causing the 404
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
    COALESCE((SELECT id FROM jobs LIMIT 1), 'test-job-id'),
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
) ON CONFLICT (id) DO UPDATE SET
    updated_at = NOW(),
    applicant_name = EXCLUDED.applicant_name,
    applicant_email = EXCLUDED.applicant_email,
    application_status = EXCLUDED.application_status,
    notes = EXCLUDED.notes;

-- Step 3: Verify the application was created
SELECT 
    'New Application Verification' as step,
    id,
    applicant_name,
    applicant_email,
    platform,
    application_status,
    organization_id,
    created_at,
    metadata
FROM job_applications 
WHERE id = 'd5167e49-7215-4cea-8bd9-8e24293b6dab';

-- Step 4: Create initial AI screening record for this application
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
) ON CONFLICT (application_id) DO UPDATE SET
    updated_at = NOW(),
    screening_status = EXCLUDED.screening_status,
    metadata = EXCLUDED.metadata;

-- Step 5: Verify screening record
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

-- Step 6: Check all applications that exist now
SELECT 
    'All Applications Summary' as step,
    COUNT(*) as total_applications,
    COUNT(DISTINCT platform) as platforms_used,
    COUNT(DISTINCT organization_id) as organizations,
    STRING_AGG(DISTINCT id, ', ') as application_ids
FROM job_applications
WHERE id IN ('f4e3b35a-6df3-4a76-bbcc-135354800a8d', 'd5167e49-7215-4cea-8bd9-8e24293b6dab');
