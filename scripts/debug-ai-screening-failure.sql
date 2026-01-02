-- Debug AI screening failures
-- This will help us understand why the AI screening is failing

-- Step 1: Check the specific application's screening status
SELECT 
    'Application Screening Status' as step,
    ja.id as application_id,
    ja.applicant_name,
    ja.applicant_email,
    ja.platform,
    ais.id as screening_id,
    ais.screening_status,
    ais.screening_score,
    ais.error_message,
    ais.error_code,
    ais.retry_count,
    ais.last_retry_at,
    ais.created_at as screening_created_at
FROM job_applications ja
LEFT JOIN ai_screening ais ON ja.id = ais.application_id
WHERE ja.id = 'f4e3b35a-6df3-4a76-bbcc-135354800a8d';

-- Step 2: Check all failed screenings
SELECT 
    'All Failed Screenings' as step,
    ja.applicant_name,
    ja.applicant_email,
    ja.platform,
    ais.screening_status,
    ais.error_message,
    ais.error_code,
    ais.retry_count,
    ais.created_at
FROM ai_screening ais
JOIN job_applications ja ON ais.application_id = ja.id
WHERE ais.screening_status = 'failed'
ORDER BY ais.created_at DESC;

-- Step 3: Check screening logs for errors
SELECT 
    'Screening Error Logs' as step,
    ja.applicant_name,
    asl.log_level,
    asl.log_message,
    asl.log_data,
    asl.error_details,
    asl.created_at as log_created_at
FROM ai_screening_logs asl
JOIN ai_screening ais ON asl.screening_id = ais.id
JOIN job_applications ja ON ais.application_id = ja.id
WHERE asl.log_level = 'error'
  AND ja.id = 'f4e3b35a-6df3-4a76-bbcc-135354800a8d'
ORDER BY asl.created_at DESC;

-- Step 4: Check environment variables status (from metadata)
SELECT 
    'Environment Check' as step,
    ais.metadata,
    ais.screening_model,
    ais.screening_version
FROM ai_screening ais
WHERE ais.application_id = 'f4e3b35a-6df3-4a76-bbcc-135354800a8d';

-- Step 5: Check if Mistral API key is configured (this will be in the application logs)
SELECT 
    'Mistral API Status' as step,
    'Check browser console and server logs for Mistral API errors' as status_check,
    'Common issues: API key missing, API quota exceeded, service unavailable' as common_issues;
