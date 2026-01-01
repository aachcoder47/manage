-- Check if LinkedIn integration exists and is connected
SELECT 
    i.id,
    i.platform,
    i.status,
    i.created_at,
    i.token_expires_at
FROM job_board_integrations i
WHERE i.platform = 'linkedin'
ORDER BY i.created_at DESC;

-- Check if there are any external job postings
SELECT 
    e.id,
    e.job_id,
    e.platform,
    e.external_job_id,
    e.external_job_url,
    e.posting_status,
    e.posted_at,
    e.views,
    e.applications_count
FROM external_job_posting e
WHERE e.platform = 'linkedin'
ORDER BY e.created_at DESC;
