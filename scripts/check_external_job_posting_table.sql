-- Check the structure of the external_job_posting table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'external_job_posting'
AND table_schema = 'public'
ORDER BY ordinal_position;
