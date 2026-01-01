-- Create the missing job_board_integrations table
CREATE TABLE IF NOT EXISTS job_board_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id VARCHAR(255) NOT NULL,
    organization_id VARCHAR(255) NULL,
    platform VARCHAR(50) NOT NULL, -- 'linkedin', 'indeed', 'naukri', 'other'
    status VARCHAR(20) DEFAULT 'connected', -- 'connected', 'disconnected', 'expired', 'error'
    access_token TEXT NULL,
    refresh_token TEXT NULL,
    token_expires_at TIMESTAMP WITH TIME ZONE NULL,
    api_key TEXT NULL,
    api_secret TEXT NULL,
    platform_user_id VARCHAR(255) NULL,
    platform_email VARCHAR(255) NULL,
    platform_name VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT true,
    configuration JSONB DEFAULT '{}',
    last_error TEXT NULL,
    last_error_at TIMESTAMP WITH TIME ZONE NULL,
    UNIQUE(user_id, platform)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_board_integrations_user_platform ON job_board_integrations(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_job_board_integrations_platform ON job_board_integrations(platform);
CREATE INDEX IF NOT EXISTS idx_job_board_integrations_status ON job_board_integrations(status);

-- Create the external_job_posting table if it doesn't exist
CREATE TABLE IF NOT EXISTS external_job_posting (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    job_id UUID NOT NULL,
    integration_id VARCHAR(255) NULL,
    user_id VARCHAR(255) NOT NULL,
    organization_id VARCHAR(255) NULL,
    platform VARCHAR(50) NOT NULL, -- 'linkedin', 'indeed', 'naukri', 'other'
    external_job_id VARCHAR(255) NULL,
    external_job_url VARCHAR(500) NULL,
    posting_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'posted', 'failed', 'expired'
    posted_at TIMESTAMP WITH TIME ZONE NULL,
    expires_at TIMESTAMP WITH TIME ZONE NULL,
    response_data JSONB DEFAULT '{}',
    error_message TEXT NULL,
    error_code VARCHAR(100) NULL,
    views INTEGER DEFAULT 0,
    applications_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_external_job_posting_job_id ON external_job_posting(job_id);
CREATE INDEX IF NOT EXISTS idx_external_job_posting_platform ON external_job_posting(platform);
CREATE INDEX IF NOT EXISTS idx_external_job_posting_status ON external_job_posting(posting_status);
CREATE INDEX IF NOT EXISTS idx_external_job_posting_user_id ON external_job_posting(user_id);

-- Add foreign key constraints if jobs table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jobs' AND table_schema = 'public') THEN
        ALTER TABLE external_job_posting 
        ADD CONSTRAINT fk_external_job_posting_job_id 
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
    END IF;
END $$;
