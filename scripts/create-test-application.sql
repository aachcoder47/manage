-- Create the specific application that's causing the 404 error
-- This will ensure the application exists so the screening endpoint can find it

-- Step 1: Check if we have any jobs to reference
SELECT 
    'Jobs Check' as step,
    COUNT(*) as total_jobs,
    MIN(id) as first_job_id,
    MIN(title) as first_job_title
FROM jobs;

-- Step 2: Create the specific application if it doesn't exist
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
    'f4e3b35a-6df3-4a76-bbcc-135354800a8d',
    NOW(),
    NOW(),
    COALESCE((SELECT id FROM jobs LIMIT 1), 'test-job-id'),
    'user_364WebGvJNOCngdeyz4qTP7wXXA',
    'org_35yQtFg3zHUHOYvunaXt5bxdzxb',
    NULL,
    'direct',
    'direct_app_' || gen_random_uuid(),
    'Test User',
    'test@example.com',
    '+91-9876543210',
    'https://www.linkedin.com/in/testuser',
    'https://example.com/resumes/test_user_resume.pdf',
    'I am very interested in this position and believe my skills align perfectly with your requirements. I have extensive experience in software development and would love to contribute to your team.',
    'pending',
    'direct',
    NOW(),
    NOW(),
    'Test application created for debugging screening endpoint',
    '{"test": true, "created_for_debugging": true, "debugging_purpose": "screening_404_error"}',
    true
) ON CONFLICT (id) DO UPDATE SET
    updated_at = NOW(),
    applicant_name = EXCLUDED.applicant_name,
    applicant_email = EXCLUDED.applicant_email,
    application_status = EXCLUDED.application_status,
    notes = EXCLUDED.notes;

-- Step 3: Verify the application was created
SELECT 
    'Application Verification' as step,
    id,
    applicant_name,
    applicant_email,
    platform,
    application_status,
    created_at,
    metadata
FROM job_applications 
WHERE id = 'f4e3b35a-6df3-4a76-bbcc-135354800a8d';

-- Step 4: Create initial AI screening record
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
    'f4e3b35a-6df3-4a76-bbcc-135354800a8d',
    'pending',
    '{"initial": true}',
    0.00,
    'Initial screening record created for debugging',
    'mistral-7b',
    '1.0',
    NULL,
    NULL,
    0,
    3,
    '{"test": true, "created_for_debugging": true}',
    true
) ON CONFLICT (application_id) DO UPDATE SET
    updated_at = NOW(),
    screening_status = EXCLUDED.screening_status,
    metadata = EXCLUDED.metadata;

-- Step 5: Verify screening record
SELECT 
    'Screening Verification' as step,
    id as screening_id,
    application_id,
    screening_status,
    screening_score,
    screening_reason,
    created_at
FROM ai_screening 
WHERE application_id = 'f4e3b35a-6df3-4a76-bbcc-135354800a8d';
