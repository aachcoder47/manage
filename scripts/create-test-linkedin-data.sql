-- Create sample data for testing LinkedIn posts
-- This will create a test job and LinkedIn post to verify the system works

-- Step 1: Create a test job
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
) ON CONFLICT DO NOTHING;

-- Step 2: Create a test LinkedIn integration
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
) ON CONFLICT DO NOTHING;

-- Step 3: Create a test LinkedIn job posting
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
) ON CONFLICT DO NOTHING;

-- Step 4: Verify test data creation
SELECT 
    'Test Data Verification' as step,
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
