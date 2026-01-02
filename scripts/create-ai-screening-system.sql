-- Create AI screening system for job applications
-- This will handle AI screening of applications and track failures

-- Step 1: Create ai_screening table
CREATE TABLE IF NOT EXISTS ai_screening (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    application_id UUID NOT NULL,
    screening_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    screening_result JSONB DEFAULT '{}', -- AI analysis results
    screening_score DECIMAL(3,2) DEFAULT 0.00, -- 0.00 to 1.00
    screening_reason TEXT NULL, -- AI reasoning
    screening_model VARCHAR(50) DEFAULT 'gpt-4', -- AI model used
    screening_version VARCHAR(20) DEFAULT '1.0', -- Model version
    error_message TEXT NULL, -- Error details if failed
    error_code VARCHAR(50) NULL, -- Error code for categorization
    retry_count INTEGER DEFAULT 0, -- Number of retries attempted
    max_retries INTEGER DEFAULT 3, -- Maximum retry attempts
    last_retry_at TIMESTAMP WITH TIME ZONE NULL, -- Last retry timestamp
    metadata JSONB DEFAULT '{}', -- Additional screening metadata
    is_active BOOLEAN DEFAULT true
);

-- Step 2: Add foreign key constraint
ALTER TABLE ai_screening 
ADD CONSTRAINT ai_screening_application_id_fkey 
FOREIGN KEY (application_id) REFERENCES job_applications(id) ON DELETE CASCADE;

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_ai_screening_application_id ON ai_screening(application_id);
CREATE INDEX IF NOT EXISTS idx_ai_screening_status ON ai_screening(screening_status);
CREATE INDEX IF NOT EXISTS idx_ai_screening_score ON ai_screening(screening_score);
CREATE INDEX IF NOT EXISTS idx_ai_screening_created_at ON ai_screening(created_at);

-- Step 4: Create ai_screening_logs table for debugging
CREATE TABLE IF NOT EXISTS ai_screening_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    screening_id UUID NOT NULL,
    log_level VARCHAR(20) DEFAULT 'info', -- 'debug', 'info', 'warn', 'error'
    log_message TEXT NOT NULL,
    log_data JSONB DEFAULT '{}',
    processing_time_ms INTEGER NULL, -- Processing time in milliseconds
    api_response TEXT NULL, -- Raw API response
    error_details JSONB DEFAULT '{}'
);

-- Step 5: Add foreign key for logs
ALTER TABLE ai_screening_logs 
ADD CONSTRAINT ai_screening_logs_screening_id_fkey 
FOREIGN KEY (screening_id) REFERENCES ai_screening(id) ON DELETE CASCADE;

-- Step 6: Create index for logs
CREATE INDEX IF NOT EXISTS idx_ai_screening_logs_screening_id ON ai_screening_logs(screening_id);
CREATE INDEX IF NOT EXISTS idx_ai_screening_logs_created_at ON ai_screening_logs(created_at);

-- Step 7: Create sample AI screening records for existing applications
DO $$
DECLARE
    app_record RECORD;
    screening_count INTEGER := 0;
BEGIN
    -- Check if we have applications
    IF EXISTS (SELECT 1 FROM job_applications LIMIT 1) THEN
        -- Create AI screening records for existing applications
        FOR app_record IN 
            SELECT id, applicant_name, applicant_email, platform FROM job_applications LIMIT 5
        LOOP
            -- Create AI screening record
            INSERT INTO ai_screening (
                id,
                created_at,
                updated_at,
                application_id,
                screening_status,
                screening_result,
                screening_score,
                screening_reason,
                screening_model,
                screening_version,
                error_message,
                error_code,
                retry_count,
                max_retries,
                metadata,
                is_active
            ) VALUES (
                gen_random_uuid(),
                NOW(),
                NOW(),
                app_record.id,
                CASE 
                    WHEN app_record.platform = 'linkedin' THEN 'completed'
                    WHEN app_record.platform = 'direct' THEN 'completed'
                    ELSE 'failed'
                END,
                CASE 
                    WHEN app_record.platform = 'linkedin' THEN 
                        '{"match_score": 0.85, "skills_match": ["JavaScript", "React"], "experience_match": true}'
                    WHEN app_record.platform = 'direct' THEN 
                        '{"match_score": 0.92, "skills_match": ["Node.js", "MongoDB"], "experience_match": true}'
                    ELSE 
                        '{"match_score": 0.00, "error": "AI processing failed"}'
                END,
                CASE 
                    WHEN app_record.platform = 'linkedin' THEN 0.85
                    WHEN app_record.platform = 'direct' THEN 0.92
                    ELSE 0.00
                END,
                CASE 
                    WHEN app_record.platform = 'linkedin' THEN 'Strong candidate with relevant experience'
                    WHEN app_record.platform = 'direct' THEN 'Excellent match for the position'
                    ELSE 'AI screening failed due to processing error'
                END,
                'gpt-4',
                '1.0',
                CASE 
                    WHEN app_record.platform IN ('linkedin', 'direct') THEN NULL
                    ELSE 'AI service unavailable'
                END,
                CASE 
                    WHEN app_record.platform IN ('linkedin', 'direct') THEN NULL
                    ELSE 'AI_SERVICE_ERROR'
                END,
                CASE 
                    WHEN app_record.platform IN ('linkedin', 'direct') THEN 0
                    ELSE 1
                END,
                3,
                CASE 
                    WHEN app_record.platform IN ('linkedin', 'direct') THEN 
                        '{"processing_time": 1500, "model_confidence": 0.95}'
                    ELSE 
                        '{"processing_time": 0, "model_confidence": 0.00}'
                END,
                true
            );
            
            screening_count := screening_count + 1;
            
            -- Create log entry
            INSERT INTO ai_screening_logs (
                id,
                created_at,
                screening_id,
                log_level,
                log_message,
                log_data,
                processing_time_ms,
                api_response,
                error_details
            ) VALUES (
                gen_random_uuid(),
                NOW(),
                (SELECT id FROM ai_screening WHERE application_id = app_record.id ORDER BY created_at DESC LIMIT 1),
                CASE 
                    WHEN app_record.platform IN ('linkedin', 'direct') THEN 'info'
                    ELSE 'error'
                END,
                CASE 
                    WHEN app_record.platform = 'linkedin' THEN 'AI screening completed successfully'
                    WHEN app_record.platform = 'direct' THEN 'AI screening completed successfully'
                    ELSE 'AI screening failed'
                END,
                CASE 
                    WHEN app_record.platform = 'linkedin' THEN 
                        '{"candidate": "' || app_record.applicant_name || '", "platform": "' || app_record.platform || '"}'
                    WHEN app_record.platform = 'direct' THEN 
                        '{"candidate": "' || app_record.applicant_name || '", "platform": "' || app_record.platform || '"}'
                    ELSE 
                        '{"error": "processing_failed", "platform": "' || app_record.platform || '"}'
                END,
                CASE 
                    WHEN app_record.platform IN ('linkedin', 'direct') THEN 1500
                    ELSE 0
                END,
                CASE 
                    WHEN app_record.platform IN ('linkedin', 'direct') THEN 
                        '{"status": "success", "score": ' || 
                        CASE WHEN app_record.platform = 'linkedin' THEN '0.85' ELSE '0.92' END || '}'
                    ELSE 
                        '{"status": "error", "message": "AI service unavailable"}'
                END,
                CASE 
                    WHEN app_record.platform IN ('linkedin', 'direct') THEN NULL
                    ELSE '{"error_type": "service_unavailable", "retry_after": 300}'
                END
            );
        END LOOP;
        
        RAISE NOTICE 'Created % AI screening records', screening_count;
    ELSE
        RAISE NOTICE 'No applications found to create AI screening records';
    END IF;
END $$;

-- Step 8: Verify AI screening creation
SELECT 
    'AI Screening Verification' as step,
    COUNT(*) as total_screenings,
    COUNT(DISTINCT application_id) as unique_applications,
    COUNT(DISTINCT screening_status) as status_types
FROM ai_screening;

-- Step 9: Show AI screening results
SELECT 
    'AI Screening Results' as step,
    ja.applicant_name,
    ja.applicant_email,
    ja.platform,
    ais.screening_status,
    ais.screening_score,
    ais.screening_reason,
    ais.error_message,
    ais.created_at
FROM ai_screening ais
JOIN job_applications ja ON ais.application_id = ja.id
ORDER BY ais.created_at DESC
LIMIT 5;

-- Step 10: Show failed screenings
SELECT 
    'Failed Screenings' as step,
    ja.applicant_name,
    ja.platform,
    ais.error_message,
    ais.error_code,
    ais.retry_count,
    ais.last_retry_at
FROM ai_screening ais
JOIN job_applications ja ON ais.application_id = ja.id
WHERE ais.screening_status = 'failed'
ORDER BY ais.created_at DESC;
