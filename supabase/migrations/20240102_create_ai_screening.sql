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
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ai_screening_application_id_fkey') THEN
        ALTER TABLE ai_screening 
        ADD CONSTRAINT ai_screening_application_id_fkey 
        FOREIGN KEY (application_id) REFERENCES job_applications(id) ON DELETE CASCADE;
    END IF;
END $$;

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
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ai_screening_logs_screening_id_fkey') THEN
        ALTER TABLE ai_screening_logs 
        ADD CONSTRAINT ai_screening_logs_screening_id_fkey 
        FOREIGN KEY (screening_id) REFERENCES ai_screening(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 6: Create index for logs
CREATE INDEX IF NOT EXISTS idx_ai_screening_logs_screening_id ON ai_screening_logs(screening_id);
CREATE INDEX IF NOT EXISTS idx_ai_screening_logs_created_at ON ai_screening_logs(created_at);
