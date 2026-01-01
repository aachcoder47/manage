-- Check what tables actually exist in the database
SELECT table_name, table_schema, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Delete only external job postings if the table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'external_job_posting' AND table_schema = 'public') THEN
        DELETE FROM external_job_posting;
        RAISE NOTICE 'Deleted all external job postings';
    ELSE
        RAISE NOTICE 'external_job_posting table does not exist';
    END IF;
END $$;

-- Delete only job board integrations if the table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'job_board_integrations' AND table_schema = 'public') THEN
        DELETE FROM job_board_integrations;
        RAISE NOTICE 'Deleted all job board integrations';
    ELSE
        RAISE NOTICE 'job_board_integrations table does not exist';
    END IF;
END $$;

-- Check what remains after deletion
SELECT 
    'external_job_posting' as table_name, 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'external_job_posting' AND table_schema = 'public') 
        THEN (SELECT COUNT(*) FROM external_job_posting)
        ELSE 0
    END as count
UNION ALL
SELECT 
    'job_board_integrations' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'job_board_integrations' AND table_schema = 'public') 
        THEN (SELECT COUNT(*) FROM job_board_integrations)
        ELSE 0
    END as count
UNION ALL
SELECT 
    'jobs' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jobs' AND table_schema = 'public') 
        THEN (SELECT COUNT(*) FROM jobs)
        ELSE 0
    END as count
UNION ALL
SELECT 
    'job_applications' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'job_applications' AND table_schema = 'public') 
        THEN (SELECT COUNT(*) FROM job_applications)
        ELSE 0
    END as count
UNION ALL
SELECT 
    'interviews' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'interviews' AND table_schema = 'public') 
        THEN (SELECT COUNT(*) FROM interviews)
        ELSE 0
    END as count;
