-- Check LinkedIn integration status and permissions
-- This will help identify why LinkedIn feed posts are not working

-- Step 1: Check if LinkedIn integration exists
SELECT 
    'LinkedIn Integration Check' as step,
    i.id,
    i.user_id,
    i.platform,
    i.status,
    i.access_token IS NOT NULL as has_token,
    i.refresh_token IS NOT NULL as has_refresh_token,
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

-- Step 2: Check LinkedIn job postings
SELECT 
    'LinkedIn Job Posts Check' as step,
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

-- Step 3: Check what permissions were requested during OAuth
-- This would be in the LinkedIn app settings, not in database
