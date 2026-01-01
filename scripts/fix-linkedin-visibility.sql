-- Complete LinkedIn troubleshooting and data creation script
-- This will help identify why LinkedIn posts are not visible

-- Step 1: Check what tables exist
SELECT 
    'Table Existence Check' as step,
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

-- Step 2: Check current data counts
SELECT 
    'Current Data Counts' as step,
    'jobs' as table_name,
    COUNT(*) as count
FROM jobs
UNION ALL
SELECT 
    'Current Data Counts' as step,
    'job_board_integrations' as table_name,
    COUNT(*) as count
FROM job_board_integrations
UNION ALL
SELECT 
    'Current Data Counts' as step,
    'external_job_posting' as table_name,
    COUNT(*) as count
FROM external_job_posting;

-- Step 3: Check LinkedIn-specific data
SELECT 
    'LinkedIn Data Check' as step,
    'job_board_integrations' as table_name,
    COUNT(*) as count,
    'LinkedIn integrations'
FROM job_board_integrations
WHERE platform = 'linkedin'
UNION ALL
SELECT 
    'LinkedIn Data Check' as step,
    'external_job_posting' as table_name,
    COUNT(*) as count,
    'LinkedIn posts'
FROM external_job_posting
WHERE platform = 'linkedin';

-- Step 4: Create missing tables if they don't exist
DO $$
BEGIN
    -- Create jobs table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jobs' AND table_schema = 'public') THEN
        CREATE TABLE jobs (
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
        RAISE NOTICE 'Created jobs table';
    END IF;

    -- Create job_board_integrations table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'job_board_integrations' AND table_schema = 'public') THEN
        CREATE TABLE job_board_integrations (
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
        RAISE NOTICE 'Created job_board_integrations table';
    END IF;

    -- Create external_job_posting table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'external_job_posting' AND table_schema = 'public') THEN
        CREATE TABLE external_job_posting (
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
        RAISE NOTICE 'Created external_job_posting table';
    END IF;
END $$;

-- Step 5: Create sample data for testing
DO $$
BEGIN
    -- Create a test job if none exists
    IF NOT EXISTS (SELECT 1 FROM jobs LIMIT 1) THEN
        INSERT INTO jobs (
            id,
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
            'org_test_123',
            'Senior Software Engineer',
            'We are looking for a talented Senior Software Engineer to join our dynamic team. You will work on cutting-edge projects and help shape the future of our platform.',
            'Bangalore, Karnataka',
            'full-time',
            '₹15,00,000 - ₹25,00,000 per annum',
            true,
            'open',
            0,
            'Tech Company',
            'Leading technology company focused on innovation'
        );
        RAISE NOTICE 'Created test job: Senior Software Engineer';
    END IF;

    -- Create a test LinkedIn integration if none exists
    IF NOT EXISTS (SELECT 1 FROM job_board_integrations WHERE platform = 'linkedin' LIMIT 1) THEN
        INSERT INTO job_board_integrations (
            id,
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
            configuration
        ) VALUES (
            gen_random_uuid(),
            'user_test_123',
            'org_test_123',
            'linkedin',
            'connected',
            'test_access_token_123',
            'test_refresh_token_123',
            NOW() + INTERVAL '60 days',
            'linkedin_user_123',
            'test@example.com',
            'Test User',
            true,
            '{}'
        );
        RAISE NOTICE 'Created test LinkedIn integration';
    END IF;

    -- Create a test LinkedIn job posting if none exists
    IF NOT EXISTS (SELECT 1 FROM external_job_posting WHERE platform = 'linkedin' LIMIT 1) THEN
        INSERT INTO external_job_posting (
            id,
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
            views,
            applications_count
        ) VALUES (
            gen_random_uuid(),
            (SELECT id FROM jobs WHERE title = 'Senior Software Engineer' LIMIT 1),
            (SELECT id FROM job_board_integrations WHERE platform = 'linkedin' LIMIT 1),
            'user_test_123',
            'org_test_123',
            'linkedin',
            'linkedin_share_123',
            'https://www.linkedin.com/feed/update/test-123',
            'posted',
            NOW(),
            '{"shareId": "test-123", "shareUrl": "https://www.linkedin.com/feed/update/test-123"}',
            0,
            0
        );
        RAISE NOTICE 'Created test LinkedIn job posting';
    END IF;
END $$;

-- Step 6: Verify final state
SELECT 
    'Final Verification' as step,
    'jobs' as table_name,
    COUNT(*) as count
FROM jobs
WHERE title = 'Senior Software Engineer'
UNION ALL
SELECT 
    'Final Verification' as step,
    'job_board_integrations' as table_name,
    COUNT(*) as count
FROM job_board_integrations
WHERE platform = 'linkedin'
UNION ALL
SELECT 
    'Final Verification' as step,
    'external_job_posting' as table_name,
    COUNT(*) as count
FROM external_job_posting
WHERE platform = 'linkedin';
