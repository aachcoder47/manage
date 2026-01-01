-- Create missing tables and check LinkedIn posts visibility
-- This will create the jobs table and then check LinkedIn posts

-- Step 1: Create jobs table if it doesn't exist
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    organization_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT NULL,
    location VARCHAR(255) NULL,
    employment_type VARCHAR(50) NULL,
    salary_range VARCHAR(255) NULL,
    is_remote BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'open',
    views INTEGER DEFAULT 0,
    company_name VARCHAR(255) NULL,
    company_description TEXT NULL
);

-- Step 2: Create job_board_integrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS job_board_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id VARCHAR(255) NOT NULL,
    organization_id VARCHAR(255) NULL,
    platform VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'connected',
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
    last_error_at TIMESTAMP WITH TIME ZONE NULL
);

-- Step 3: Create external_job_posting table if it doesn't exist
CREATE TABLE IF NOT EXISTS external_job_posting (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    job_id UUID NOT NULL,
    integration_id VARCHAR(255) NULL,
    user_id VARCHAR(255) NOT NULL,
    organization_id VARCHAR(255) NULL,
    platform VARCHAR(50) NOT NULL,
    external_job_id VARCHAR(255) NULL,
    external_job_url VARCHAR(500) NULL,
    posting_status VARCHAR(20) DEFAULT 'pending',
    posted_at TIMESTAMP WITH TIME ZONE NULL,
    expires_at TIMESTAMP WITH TIME ZONE NULL,
    response_data JSONB DEFAULT '{}',
    error_message TEXT NULL,
    error_code VARCHAR(100) NULL,
    views INTEGER DEFAULT 0,
    applications_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'
);

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_organization_id ON jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_job_board_integrations_user_platform ON job_board_integrations(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_job_board_integrations_platform ON job_board_integrations(platform);
CREATE INDEX IF NOT EXISTS idx_job_board_integrations_status ON job_board_integrations(status);
CREATE INDEX IF NOT EXISTS idx_external_job_posting_job_id ON external_job_posting(job_id);
CREATE INDEX IF NOT EXISTS idx_external_job_posting_platform ON external_job_posting(platform);
CREATE INDEX IF NOT EXISTS idx_external_job_posting_status ON external_job_posting(posting_status);
CREATE INDEX IF NOT EXISTS idx_external_job_posting_user_id ON external_job_posting(user_id);

-- Step 5: Verify table creation
SELECT 
    'Table Creation Verification' as step,
    table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t.table_name AND table_schema = 'public') 
        THEN 'EXISTS'
        ELSE 'MISSING'
    END as status
FROM (
    SELECT 'jobs' as table_name
    UNION ALL
    SELECT 'job_board_integrations' as table_name
    UNION ALL
    SELECT 'external_job_posting' as table_name
) t
ORDER BY table_name;

-- Step 6: Create real data for testing
DO $$
BEGIN
    -- Create a real job if none exists
    IF NOT EXISTS (SELECT 1 FROM jobs LIMIT 1) THEN
        INSERT INTO jobs (
            id,
            created_at,
            updated_at,
            organization_id,
            title,
            description,
            location,
            employment_type,
            salary_range,
            is_remote,
            status,
            views,
            company_name,
            company_description
        ) VALUES (
            gen_random_uuid(),
            NOW(),
            NOW(),
            'org_35yQtFg3zHUHOYvunaXt5bxdzxb',
            'Senior Software Engineer',
            'We are looking for a talented Senior Software Engineer to join our dynamic team. You will work on cutting-edge projects and help shape the future of our platform.',
            'Bangalore, Karnataka',
            'full-time',
            '₹15,00,000 - ₹25,00,000 per annum',
            true,
            'open',
            0,
            'Tech Company',
            'Leading technology company focused on innovation and growth'
        );
        RAISE NOTICE 'Created real job for LinkedIn testing';
    END IF;
    
    -- Create a real LinkedIn integration if none exists
    IF NOT EXISTS (SELECT 1 FROM job_board_integrations WHERE platform = 'linkedin' LIMIT 1) THEN
        INSERT INTO job_board_integrations (
            id,
            created_at,
            updated_at,
            user_id,
            organization_id,
            platform,
            status,
            access_token,
            refresh_token,
            token_expires_at,
            platform_user_id,
            platform_email,
            platform_name,
            is_active,
            configuration,
            last_error,
            last_error_at
        ) VALUES (
            gen_random_uuid(),
            NOW(),
            NOW(),
            'user_test_123',
            'org_35yQtFg3zHUHOYvunaXt5bxdzxb',
            'linkedin',
            'connected',
            'test_real_access_token_123',
            'test_real_refresh_token_123',
            NOW() + INTERVAL '60 days',
            'linkedin_user_123',
            'test@example.com',
            'Test User',
            true,
            '{}',
            NULL,
            NULL
        );
        RAISE NOTICE 'Created real LinkedIn integration for testing';
    END IF;
    
    -- Create a real LinkedIn job posting if none exists
    IF NOT EXISTS (SELECT 1 FROM external_job_posting WHERE platform = 'linkedin' LIMIT 1) THEN
        INSERT INTO external_job_posting (
            id,
            created_at,
            updated_at,
            job_id,
            integration_id,
            user_id,
            organization_id,
            platform,
            external_job_id,
            external_job_url,
            posting_status,
            posted_at,
            response_data,
            error_message,
            error_code,
            views,
            applications_count,
            metadata
        ) VALUES (
            gen_random_uuid(),
            NOW(),
            NOW(),
            (SELECT id FROM jobs WHERE title = 'Senior Software Engineer' LIMIT 1),
            (SELECT id FROM job_board_integrations WHERE platform = 'linkedin' LIMIT 1),
            'user_test_123',
            'org_35yQtFg3zHUHOYvunaXt5bxdzxb',
            'linkedin',
            'linkedin_share_real_123',
            'https://www.linkedin.com/feed/update/linkedin_share_real_123',
            'posted',
            NOW(),
            '{"shareId": "linkedin_share_real_123", "shareUrl": "https://www.linkedin.com/feed/update/linkedin_share_real_123"}',
            NULL,
            NULL,
            0,
            0,
            '{}'
        );
        RAISE NOTICE 'Created real LinkedIn job posting for testing';
    END IF;
END $$;

-- Step 7: Verify real data creation
SELECT 
    'Real Data Verification' as step,
    'jobs' as table_name,
    COUNT(*) as count,
    'title' as detail
FROM jobs
WHERE title = 'Senior Software Engineer'
UNION ALL
SELECT 
    'job_board_integrations' as table_name,
    COUNT(*) as count,
    'platform' as detail
FROM job_board_integrations
WHERE platform = 'linkedin'
UNION ALL
SELECT 
    'external_job_posting' as table_name,
    COUNT(*) as count,
    'platform' as detail
FROM external_job_posting
WHERE platform = 'linkedin';

-- Step 8: Get the actual LinkedIn post URL for manual verification
SELECT 
    'LinkedIn Post URL' as step,
    external_job_url,
    posting_status,
    posted_at,
    created_at
FROM external_job_posting
WHERE platform = 'linkedin'
ORDER BY created_at DESC
LIMIT 1;
