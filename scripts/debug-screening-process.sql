-- Check specific screening process issues when Mistral is working
-- This will help identify where the screening process is failing

-- Step 1: Check if the application exists and has complete data
SELECT 
    'Application Data Check' as step,
    ja.id,
    ja.applicant_name,
    ja.applicant_email,
    ja.resume_url,
    ja.cover_letter,
    ja.platform,
    ja.application_status,
    j.title as job_title,
    j.description as job_description,
    o.name as organization_name,
    CASE 
        WHEN ja.applicant_name IS NULL OR ja.applicant_email IS NULL THEN '❌ Missing basic info'
        WHEN j.id IS NULL THEN '❌ No job linked'
        WHEN j.description IS NULL THEN '⚠️ No job description'
        ELSE '✅ Data complete'
    END as data_status
FROM job_applications ja
LEFT JOIN jobs j ON ja.job_id = j.id
LEFT JOIN organizations o ON j.organization_id = o.id
WHERE ja.id = 'f4e3b35a-6df3-4a76-bbcc-135354800a8d';

-- Step 2: Check screening records and their status
SELECT 
    'Screening Records Check' as step,
    ais.id as screening_id,
    ais.application_id,
    ais.screening_status,
    ais.screening_score,
    ais.error_message,
    ais.error_code,
    ais.retry_count,
    ais.last_retry_at,
    ais.created_at,
    ais.updated_at,
    CASE 
        WHEN ais.screening_status = 'completed' THEN '✅ Completed'
        WHEN ais.screening_status = 'processing' THEN '⏳ Processing'
        WHEN ais.screening_status = 'failed' THEN '❌ Failed'
        WHEN ais.screening_status = 'pending' THEN '⏸️ Pending'
        ELSE '❓ Unknown'
    END as status_indicator
FROM ai_screening ais
WHERE ais.application_id = 'f4e3b35a-6df3-4a76-bbcc-135354800a8d'
ORDER BY ais.created_at DESC;

-- Step 3: Check screening logs for detailed error information
SELECT 
    'Screening Logs Check' as step,
    asl.id as log_id,
    asl.screening_id,
    asl.log_level,
    asl.log_message,
    asl.log_data,
    asl.processing_time_ms,
    asl.api_response,
    asl.error_details,
    asl.created_at as log_created_at,
    CASE 
        WHEN asl.log_level = 'error' THEN '🔴 Error'
        WHEN asl.log_level = 'warn' THEN '🟡 Warning'
        WHEN asl.log_level = 'info' THEN '🔵 Info'
        ELSE '⚪ Debug'
    END as level_indicator
FROM ai_screening_logs asl
JOIN ai_screening ais ON asl.screening_id = ais.id
WHERE ais.application_id = 'f4e3b35a-6df3-4a76-bbcc-135354800a8d'
ORDER BY asl.created_at DESC;

-- Step 4: Check if there are any stuck screenings
SELECT 
    'Stuck Screenings Check' as step,
    COUNT(*) as stuck_count,
    screening_status,
    AVG(EXTRACT(EPOCH FROM (NOW() - created_at))/60) as avg_minutes_stuck
FROM ai_screening
WHERE screening_status = 'processing'
  AND created_at < NOW() - INTERVAL '5 minutes'
GROUP BY screening_status;

-- Step 5: Check database table structures
SELECT 
    'Table Structure Check' as step,
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('job_applications', 'ai_screening', 'ai_screening_logs')
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- Step 6: Check recent screening activity
SELECT 
    'Recent Screening Activity' as step,
    ja.applicant_name,
    ja.platform,
    ais.screening_status,
    ais.screening_score,
    ais.created_at,
    CASE 
        WHEN ais.error_message IS NOT NULL THEN '❌ Has errors'
        ELSE '✅ No errors'
    END as error_status
FROM ai_screening ais
JOIN job_applications ja ON ais.application_id = ja.id
WHERE ais.created_at > NOW() - INTERVAL '1 hour'
ORDER BY ais.created_at DESC
LIMIT 10;
