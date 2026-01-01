-- Delete posts from external platforms with detailed logging
-- This script shows what will be deleted before actually deleting

-- Step 1: Show what will be deleted
SELECT 
    'BEFORE DELETION' as step,
    e.platform,
    e.external_job_id,
    e.external_job_url,
    e.posting_status,
    e.posted_at,
    e.created_at
FROM external_job_posting e
ORDER BY e.platform, e.created_at DESC;

-- Step 2: Show integrations that will be deleted
SELECT 
    'BEFORE DELETION' as step,
    i.platform,
    i.status,
    i.platform_user_id,
    i.created_at,
    i.updated_at
FROM job_board_integrations i
ORDER BY i.platform, i.created_at DESC;

-- Step 3: Perform the deletions
-- Uncomment these lines to actually delete the data

-- Delete all external job postings
-- DELETE FROM external_job_posting;

-- Delete all job board integrations
-- DELETE FROM job_board_integrations;

-- Step 4: Verify deletion
SELECT 
    'AFTER DELETION' as step,
    'external_job_posting' as table_name, 
    COUNT(*) as count 
FROM external_job_posting
UNION ALL
SELECT 
    'AFTER DELETION' as step,
    'job_board_integrations' as table_name, 
    COUNT(*) as count 
FROM job_board_integrations
UNION ALL
SELECT 
    'AFTER DELETION' as step,
    'jobs' as table_name, 
    COUNT(*) as count 
FROM jobs
UNION ALL
SELECT 
    'AFTER DELETION' as step,
    'job_applications' as table_name, 
    COUNT(*) as count 
FROM job_applications;
