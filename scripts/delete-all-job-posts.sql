-- Delete all existing job posts and related data

-- Step 1: Delete external job postings (LinkedIn, Indeed, Naukri posts)
DELETE FROM external_job_posting;

-- Step 2: Delete job board integrations (LinkedIn, Indeed, Naukri connections)
DELETE FROM job_board_integrations;

-- Step 3: Delete all job applications
DELETE FROM job_applications;

-- Step 4: Delete all interviews
DELETE FROM interviews;

-- Step 5: Delete all jobs
DELETE FROM jobs;

-- Step 6: Reset sequences if needed (optional)
-- Uncomment if you want to reset auto-increment IDs
-- ALTER SEQUENCE IF EXISTS jobs_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS job_applications_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS interviews_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS job_board_integrations_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS external_job_posting_id_seq RESTART WITH 1;

-- Step 7: Verify deletion
SELECT 
    'jobs' as table_name, COUNT(*) as count FROM jobs
UNION ALL
SELECT 
    'job_applications' as table_name, COUNT(*) as count FROM job_applications
UNION ALL
SELECT 
    'interviews' as table_name, COUNT(*) as count FROM interviews
UNION ALL
SELECT 
    'job_board_integrations' as table_name, COUNT(*) as count FROM job_board_integrations
UNION ALL
SELECT 
    'external_job_posting' as table_name, COUNT(*) as count FROM external_job_posting;
