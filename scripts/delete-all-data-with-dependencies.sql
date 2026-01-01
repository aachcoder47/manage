-- Delete external job posts and related data with proper foreign key handling
-- This script handles dependencies in the correct order

-- Step 1: Delete external job postings (no dependencies)
DELETE FROM external_job_posting;

-- Step 2: Delete job board integrations (no dependencies)
DELETE FROM job_board_integrations;

-- Step 3: Delete job applications (depends on jobs)
DELETE FROM job_applications;

-- Step 4: Delete interviews (depends on jobs)
DELETE FROM interviews;

-- Step 5: Delete jobs (no more dependencies)
DELETE FROM jobs;

-- Step 6: Verify deletion
SELECT 
    'external_job_posting' as table_name, COUNT(*) as count FROM external_job_posting
UNION ALL
SELECT 
    'job_board_integrations' as table_name, COUNT(*) as count FROM job_board_integrations
UNION ALL
SELECT 
    'job_applications' as table_name, COUNT(*) as count FROM job_applications
UNION ALL
SELECT 
    'interviews' as table_name, COUNT(*) as count FROM interviews
UNION ALL
SELECT 
    'jobs' as table_name, COUNT(*) as count FROM jobs;
