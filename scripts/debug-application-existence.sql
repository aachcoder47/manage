-- Quick debug script to check if the application exists and the route structure is correct
-- This will help us understand why the screening endpoint is returning 404

-- Step 1: Check if the specific application exists
SELECT 
    'Application Existence Check' as step,
    COUNT(*) as application_exists,
    id as application_id,
    applicant_name,
    applicant_email,
    platform,
    application_status,
    created_at
FROM job_applications 
WHERE id = 'f4e3b35a-6df3-4a76-bbcc-135354800a8d'
GROUP BY id, applicant_name, applicant_email, platform, application_status, created_at;

-- Step 2: Check if we have any applications at all
SELECT 
    'Total Applications Check' as step,
    COUNT(*) as total_applications,
    COUNT(DISTINCT platform) as platforms_used,
    MIN(created_at) as first_application,
    MAX(created_at) as last_application
FROM job_applications;

-- Step 3: Show sample application IDs that exist
SELECT 
    'Sample Application IDs' as step,
    id,
    applicant_name,
    applicant_email,
    platform,
    application_status
FROM job_applications 
ORDER BY created_at DESC
LIMIT 5;

-- Step 4: Check if ai_screening table exists and has data
SELECT 
    'AI Screening Table Check' as step,
    COUNT(*) as total_screenings,
    COUNT(DISTINCT application_id) as unique_applications_screened,
    COUNT(DISTINCT screening_status) as status_types
FROM ai_screening;

-- Step 5: Check if there are any screenings for this application
SELECT 
    'Application Screenings' as step,
    id as screening_id,
    application_id,
    screening_status,
    screening_score,
    error_message,
    created_at
FROM ai_screening 
WHERE application_id = 'f4e3b35a-6df3-4a76-bbcc-135354800a8d'
ORDER BY created_at DESC;
