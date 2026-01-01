-- Manual LinkedIn post creation script
-- This creates a LinkedIn post manually to test the system

-- First, let's create a sample job if none exists
DO $$
BEGIN
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
            views
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
            0
        );
        RAISE NOTICE 'Created test job: Senior Software Engineer';
    END IF;
END $$;

-- Create a sample LinkedIn integration if none exists
DO $$
BEGIN
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
END $$;

-- Create a sample LinkedIn job posting if none exists
DO $$
BEGIN
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

-- Show current state
SELECT 
    'Current LinkedIn Data' as info,
    'LinkedIn Integrations' as type,
    COUNT(*) as count
FROM job_board_integrations
WHERE platform = 'linkedin'
UNION ALL
SELECT 
    'Current LinkedIn Data' as info,
    'LinkedIn Job Posts' as type,
    COUNT(*) as count
FROM external_job_posting
WHERE platform = 'linkedin'
UNION ALL
SELECT 
    'Current LinkedIn Data' as info,
    'Total Jobs' as type,
    COUNT(*) as count
FROM jobs;
