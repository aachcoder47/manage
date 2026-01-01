-- Create Indeed integration tables and setup
-- This script sets up the database structure for Indeed job posting

-- Create Indeed-specific configuration table if it doesn't exist
CREATE TABLE IF NOT EXISTS indeed_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id VARCHAR(255) NOT NULL,
    organization_id VARCHAR(255) NULL,
    api_key VARCHAR(255) NOT NULL,
    api_secret VARCHAR(255) NOT NULL,
    publisher_id VARCHAR(255) NULL,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'suspended'
    configuration JSONB DEFAULT '{}',
    last_sync_at TIMESTAMP WITH TIME ZONE NULL,
    sync_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'success', 'failed'
    last_error TEXT NULL,
    UNIQUE(user_id)
);

-- Create Naukri-specific configuration table if it doesn't exist
CREATE TABLE IF NOT EXISTS naukri_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id VARCHAR(255) NOT NULL,
    organization_id VARCHAR(255) NULL,
    api_key VARCHAR(255) NOT NULL,
    api_secret VARCHAR(255) NOT NULL,
    company_id VARCHAR(255) NULL,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'suspended'
    configuration JSONB DEFAULT '{}',
    last_sync_at TIMESTAMP WITH TIME ZONE NULL,
    sync_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'success', 'failed'
    last_error TEXT NULL,
    UNIQUE(user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_indeed_configurations_user_id ON indeed_configurations(user_id);
CREATE INDEX IF NOT EXISTS idx_indeed_configurations_status ON indeed_configurations(status);
CREATE INDEX IF NOT EXISTS idx_naukri_configurations_user_id ON naukri_configurations(user_id);
CREATE INDEX IF NOT EXISTS idx_naukri_configurations_status ON naukri_configurations(status);

-- Verify table creation
SELECT 
    'indeed_configurations' as table_name, 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'indeed_configurations' AND table_schema = 'public') 
        THEN (SELECT COUNT(*) FROM indeed_configurations)
        ELSE 0
    END as count
UNION ALL
SELECT 
    'naukri_configurations' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'naukri_configurations' AND table_schema = 'public') 
        THEN (SELECT COUNT(*) FROM naukri_configurations)
        ELSE 0
    END as count;
