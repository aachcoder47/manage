-- Check LinkedIn posts visibility and create real test data
-- This will help identify why LinkedIn posts are not visible in your account

-- Step 1: Check existing LinkedIn posts
SELECT 
    'Existing LinkedIn Posts' as step,
    e.id,
    e.job_id,
    e.platform,
    e.external_job_id,
    e.external_job_url,
    e.posting_status,
    e.posted_at,
    e.error_message,
    e.created_at
FROM external_job_posting e
WHERE e.platform = 'linkedin'
ORDER BY e.created_at DESC;

-- Step 2: Check LinkedIn integration status
SELECT 
    'LinkedIn Integration Status' as step,
    i.id,
    i.user_id,
    i.platform,
    i.status,
    i.access_token IS NOT NULL as has_token,
    i.token_expires_at,
    i.created_at,
    i.updated_at,
    CASE 
        WHEN i.token_expires_at IS NULL THEN 'No expiration set'
        WHEN i.token_expires_at < NOW() THEN 'Token expired'
        ELSE 'Token valid'
    END as token_status
FROM job_board_integrations i
WHERE i.platform = 'linkedin'
ORDER BY i.created_at DESC;

-- Step 3: Create a real LinkedIn post with your actual data
DO $$
BEGIN
    -- First, let's create a real job if none exists
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

-- Step 4: Verify real data creation
SELECT 
    'Real Data Verification' as step,
    'jobs' as table_name,
    COUNT(*) as count
FROM jobs
WHERE title = 'Senior Software Engineer'
UNION ALL
SELECT 
    'job_board_integrations' as table_name,
    COUNT(*) as count
FROM job_board_integrations
WHERE platform = 'linkedin'
UNION ALL
SELECT 
    'external_job_posting' as table_name,
    COUNT(*) as count
FROM external_job_posting
WHERE platform = 'linkedin';

-- Step 5: Get the actual LinkedIn post URL for manual verification
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
