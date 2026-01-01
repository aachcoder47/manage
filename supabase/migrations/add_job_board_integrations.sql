-- Job Board Integration Tables
-- This migration adds support for users to connect their own job board accounts
-- and post jobs to external platforms (LinkedIn, Indeed, Naukri)

-- Create enum for job board platforms
CREATE TYPE job_board_platform AS ENUM ('linkedin', 'indeed', 'naukri', 'other');

-- Create enum for integration status
CREATE TYPE integration_status AS ENUM ('connected', 'disconnected', 'expired', 'error');

-- Create enum for posting status
CREATE TYPE posting_status AS ENUM ('pending', 'posted', 'failed', 'expired');

-- Table to store user's job board account integrations
CREATE TABLE job_board_integration (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    organization_id TEXT REFERENCES organization(id) ON DELETE CASCADE,
    platform job_board_platform NOT NULL,
    status integration_status DEFAULT 'connected',
    
    -- OAuth tokens (encrypted at application level)
    access_token TEXT, -- Encrypted access token
    refresh_token TEXT, -- Encrypted refresh token
    token_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- API keys (for platforms that use API keys instead of OAuth)
    api_key TEXT, -- Encrypted API key
    api_secret TEXT, -- Encrypted API secret (if needed)
    
    -- Platform-specific data
    platform_user_id TEXT, -- User's ID on the external platform
    platform_email TEXT, -- User's email on the external platform
    platform_name TEXT, -- Display name from platform
    
    -- Configuration
    is_active BOOLEAN DEFAULT true,
    configuration JSONB, -- Platform-specific settings
    
    -- Error tracking
    last_error TEXT,
    last_error_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    UNIQUE(user_id, platform, organization_id) -- One integration per platform per user per org
);

-- Table to track job postings to external boards
CREATE TABLE external_job_posting (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    
    -- References
    job_id TEXT NOT NULL REFERENCES job(id) ON DELETE CASCADE,
    integration_id TEXT NOT NULL REFERENCES job_board_integration(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    organization_id TEXT REFERENCES organization(id) ON DELETE CASCADE,
    
    -- Platform info
    platform job_board_platform NOT NULL,
    
    -- External platform data
    external_job_id TEXT, -- Job ID on external platform
    external_job_url TEXT, -- URL to job on external platform
    posting_status posting_status DEFAULT 'pending',
    
    -- Posting details
    posted_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Response data
    response_data JSONB, -- Full response from external API
    error_message TEXT,
    error_code TEXT,
    
    -- Analytics
    views INTEGER DEFAULT 0,
    applications_count INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB -- Additional platform-specific data
);

-- Indexes for performance
CREATE INDEX idx_job_board_integration_user_id ON job_board_integration(user_id);
CREATE INDEX idx_job_board_integration_org_id ON job_board_integration(organization_id);
CREATE INDEX idx_job_board_integration_platform ON job_board_integration(platform);
CREATE INDEX idx_job_board_integration_status ON job_board_integration(status);

CREATE INDEX idx_external_job_posting_job_id ON external_job_posting(job_id);
CREATE INDEX idx_external_job_posting_integration_id ON external_job_posting(integration_id);
CREATE INDEX idx_external_job_posting_user_id ON external_job_posting(user_id);
CREATE INDEX idx_external_job_posting_platform ON external_job_posting(platform);
CREATE INDEX idx_external_job_posting_status ON external_job_posting(posting_status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_job_board_integration_updated_at 
    BEFORE UPDATE ON job_board_integration 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_external_job_posting_updated_at 
    BEFORE UPDATE ON external_job_posting 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

