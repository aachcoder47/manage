-- Remove LinkedIn integration completely from the system
-- This will delete all LinkedIn-related data and remove LinkedIn from supported platforms

-- Step 1: Delete all LinkedIn job postings
DELETE FROM external_job_posting WHERE platform = 'linkedin';

-- Step 2: Delete all LinkedIn integrations
DELETE FROM job_board_integrations WHERE platform = 'linkedin';

-- Step 3: Verify LinkedIn data removal
SELECT 
    'external_job_posting' as table_name, 
    COUNT(*) as count 
FROM external_job_posting 
WHERE platform = 'linkedin'
UNION ALL
SELECT 
    'job_board_integrations' as table_name, 
    COUNT(*) as count 
FROM job_board_integrations 
WHERE platform = 'linkedin';

-- Step 4: Check remaining platforms
SELECT 
    platform,
    COUNT(*) as count
FROM external_job_posting 
GROUP BY platform
ORDER BY platform;
