-- Check foreign key constraints before deletion
-- This helps understand the dependencies

-- Check all foreign key constraints
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.table_schema, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name IN ('jobs', 'job_applications', 'interviews')
ORDER BY tc.table_name, tc.constraint_name;

-- Check what data exists in each table
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
    'external_job_posting' as table_name, COUNT(*) as count FROM external_job_posting
UNION ALL
SELECT 
    'job_board_integrations' as table_name, COUNT(*) as count FROM job_board_integrations;
