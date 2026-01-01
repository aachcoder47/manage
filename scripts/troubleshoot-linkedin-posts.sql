-- Complete LinkedIn troubleshooting script
-- This will help identify why LinkedIn job posts are not visible

-- Step 1: Check if LinkedIn integration exists
SELECT 
    'LinkedIn Integration Check' as step,
    i.id,
    i.user_id,
    i.platform,
    i.status,
    i.access_token IS NOT NULL as has_token,
    i.refresh_token IS NOT NULL as has_refresh_token,
    i.token_expires_at,
    i.created_at,
    CASE 
        WHEN i.token_expires_at IS NULL THEN 'No expiration set'
        WHEN i.token_expires_at < NOW() THEN 'Token expired'
        ELSE 'Token valid'
    END as token_status
FROM job_board_integrations i
WHERE i.platform = 'linkedin'
ORDER BY i.created_at DESC;

-- Step 2: Check if there are any LinkedIn job postings
SELECT 
    'LinkedIn Job Posts Check' as step,
    e.id,
    e.job_id,
    e.platform,
    e.external_job_id,
    e.external_job_url,
    e.posting_status,
    e.posted_at,
    e.error_message,
    e.created_at
FROM external_job_posting e
WHERE e.platform = 'linkedin'
ORDER BY e.created_at DESC;

-- Step 3: Check if there are any jobs at all
SELECT 
    'Jobs Check' as step,
    COUNT(*) as total_jobs
FROM jobs;

-- Step 4: Check recent job posting attempts
SELECT 
    'Recent Posting Attempts' as step,
    e.platform,
    e.posting_status,
    e.error_message,
    e.created_at
FROM external_job_posting e
WHERE e.created_at > NOW() - INTERVAL '24 hours'
ORDER BY e.created_at DESC;

-- Step 5: Check what tables exist
SELECT 
    'Table Existence Check' as step,
    table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t.table_name AND table_schema = 'public') 
        THEN 'EXISTS'
        ELSE 'MISSING'
    END as status
FROM (
    SELECT 'jobs' as table_name
    UNION ALL
    SELECT 'job_applications' as table_name
    UNION ALL
    SELECT 'interviews' as table_name
    UNION ALL
    SELECT 'external_job_posting' as table_name
    UNION ALL
    SELECT 'job_board_integrations' as table_name
) t
ORDER BY table_name;
