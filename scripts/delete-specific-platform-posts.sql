-- Delete job posts from specific platforms
-- Use this if you want to delete posts from specific platforms only

-- Option 1: Delete only LinkedIn posts
DELETE FROM external_job_posting WHERE platform = 'linkedin';
DELETE FROM job_board_integrations WHERE platform = 'linkedin';

-- Option 2: Delete only Indeed posts
-- DELETE FROM external_job_posting WHERE platform = 'indeed';
-- DELETE FROM job_board_integrations WHERE platform = 'indeed';

-- Option 3: Delete only Naukri posts
-- DELETE FROM external_job_posting WHERE platform = 'naukri';
-- DELETE FROM job_board_integrations WHERE platform = 'naukri';

-- Option 4: Delete posts from multiple platforms
-- DELETE FROM external_job_posting WHERE platform IN ('linkedin', 'indeed');
-- DELETE FROM job_board_integrations WHERE platform IN ('linkedin', 'indeed');

-- Step 5: Verify what remains
SELECT 
    platform,
    COUNT(*) as post_count
FROM external_job_posting 
GROUP BY platform
ORDER BY platform;

SELECT 
    platform,
    COUNT(*) as integration_count
FROM job_board_integrations 
GROUP BY platform
ORDER BY platform;
