-- Quick check to see what's in the database after running the fix script
-- This will help us understand why the API is still returning 400

-- Step 1: Check if job_applications table exists
SELECT 
    'Table Existence Check' as step,
    table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'job_applications' AND table_schema = 'public')
        THEN 'EXISTS'
        ELSE 'MISSING'
    END as status
FROM (SELECT 'job_applications' as table_name) t;

-- Step 2: Check if we have any applications
SELECT 
    'Applications Count' as step,
    COUNT(*) as total_applications,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT job_id) as unique_jobs
FROM job_applications;

-- Step 3: Check applications for your specific user
SELECT 
    'Your Applications' as step,
    COUNT(*) as your_applications,
    MIN(applied_at) as first_application,
    MAX(applied_at) as last_application
FROM job_applications 
WHERE user_id = 'user_364WebGvJNOCngdeyz4qTP7wXXA';

-- Step 4: Show sample application data
SELECT 
    'Sample Application Data' as step,
    id,
    applicant_name,
    applicant_email,
    platform,
    application_status,
    applied_at,
    job_id,
    external_posting_id
FROM job_applications 
WHERE user_id = 'user_364WebGvJNOCngdeyz4qTP7wXXA'
ORDER BY applied_at DESC
LIMIT 3;

-- Step 5: Check if jobs table exists and has data
SELECT 
    'Jobs Table Check' as step,
    COUNT(*) as total_jobs,
    COUNT(DISTINCT organization_id) as unique_orgs
FROM jobs;

-- Step 6: Check external_job_posting table structure
SELECT 
    'External Posting Table Check' as step,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'external_job_posting' 
ORDER BY ordinal_position;
