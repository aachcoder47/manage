-- Create Indeed and Naukri API key-based integration tables
-- This script sets up the database structure for API key authentication

-- Create Indeed API key configuration table
CREATE TABLE IF NOT EXISTS indeed_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id VARCHAR(255) NOT NULL,
    organization_id VARCHAR(255) NULL,
    api_key VARCHAR(255) NOT NULL UNIQUE,
    api_secret VARCHAR(255) NOT NULL,
    publisher_id VARCHAR(255) NULL,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'suspended'
    configuration JSONB DEFAULT '{}',
    last_used_at TIMESTAMP WITH TIME ZONE NULL,
    usage_count INTEGER DEFAULT 0,
    rate_limit_remaining INTEGER DEFAULT 1000,
    rate_limit_reset_at TIMESTAMP WITH TIME ZONE NULL,
    last_error TEXT NULL,
    last_error_at TIMESTAMP WITH TIME ZONE NULL,
    UNIQUE(user_id)
);

-- Create Naukri API key configuration table
CREATE TABLE IF NOT EXISTS naukri_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id VARCHAR(255) NOT NULL,
    organization_id VARCHAR(255) NULL,
    api_key VARCHAR(255) NOT NULL UNIQUE,
    api_secret VARCHAR(255) NOT NULL,
    company_id VARCHAR(255) NULL,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'suspended'
    configuration JSONB DEFAULT '{}',
    last_used_at TIMESTAMP WITH TIME ZONE NULL,
    usage_count INTEGER DEFAULT 0,
    rate_limit_remaining INTEGER DEFAULT 1000,
    rate_limit_reset_at TIMESTAMP WITH TIME ZONE NULL,
    last_error TEXT NULL,
    last_error_at TIMESTAMP WITH TIME ZONE NULL,
    UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_indeed_api_keys_user_id ON indeed_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_indeed_api_keys_status ON indeed_api_keys(status);
CREATE INDEX IF NOT EXISTS idx_naukri_api_keys_user_id ON naukri_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_naukri_api_keys_status ON naukri_api_keys(status);

-- Verify table creation
SELECT 
    'indeed_api_keys' as table_name, 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'indeed_api_keys' AND table_schema = 'public') 
        THEN (SELECT COUNT(*) FROM indeed_api_keys)
        ELSE 0
    END as count
UNION ALL
SELECT 
    'naukri_api_keys' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'naukri_api_keys' AND table_schema = 'public') 
        THEN (SELECT COUNT(*) FROM naukri_api_keys)
        ELSE 0
    END as count;
