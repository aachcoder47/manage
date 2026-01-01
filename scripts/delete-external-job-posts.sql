-- Delete all external job postings from LinkedIn, Indeed, Naukri and other platforms
-- This removes the posts from external platforms but keeps your job data intact

-- Step 1: Delete all external job postings
DELETE FROM external_job_posting;

-- Step 2: Delete all job board integrations (connections to LinkedIn, Indeed, Naukri)
DELETE FROM job_board_integrations;

-- Step 3: Verify deletion
SELECT 
    'external_job_posting' as table_name, COUNT(*) as count FROM external_job_posting
UNION ALL
SELECT 
    'job_board_integrations' as table_name, COUNT(*) as count FROM job_board_integrations
UNION ALL
SELECT 
    'jobs' as table_name, COUNT(*) as count FROM jobs
UNION ALL
SELECT 
    'job_applications' as table_name, COUNT(*) as count FROM job_applications;
