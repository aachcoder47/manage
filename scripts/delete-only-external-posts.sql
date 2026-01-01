-- Alternative approach: Delete only external posts while keeping your data
-- This preserves your jobs, applications, and interviews

-- Step 1: Delete only external job postings (no dependencies)
DELETE FROM external_job_posting;

-- Step 2: Delete only job board integrations (no dependencies)
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
    'job_applications' as table_name, COUNT(*) as count FROM job_applications
UNION ALL
SELECT 
    'interviews' as table_name, COUNT(*) as count FROM interviews;
