-- ========================================
-- UNIVERSAL PRO SUBSCRIPTION SCRIPT
-- ========================================
-- This script handles multiple table name variations
-- Run this in your Supabase SQL Editor

-- ========================================
-- STEP 1: Find User ID for raviisys@gmail.com
-- ========================================

-- Try different possible user table names
WITH user_found AS (
  SELECT id, email FROM users WHERE email = 'raviisys@gmail.com'
),
auth_users AS (
  SELECT id, email FROM auth.users WHERE email = 'raviisys@gmail.com'
),
profiles AS (
  SELECT id, email FROM profiles WHERE email = 'raviisys@gmail.com'
)
SELECT id as user_id, email 
FROM (
  SELECT id, email FROM users WHERE email = 'raviisys@gmail.com'
  UNION ALL
  SELECT id, email FROM auth.users WHERE email = 'raviisys@gmail.com'
  UNION ALL
  SELECT id, email FROM profiles WHERE email = 'raviisys@gmail.com'
)
LIMIT 1;

-- ========================================
-- STEP 2: Find Organization ID for 'Futuristic HR'
-- ========================================

-- Try different possible organization table names
WITH org_found AS (
  SELECT id, name FROM organization WHERE name = 'Futuristic HR'
),
organizations AS (
  SELECT id, name FROM organizations WHERE name = 'Futuristic HR'
)
SELECT id as org_id, name 
FROM (
  SELECT id, name FROM organization WHERE name = 'Futuristic HR'
  UNION ALL
  SELECT id, name FROM organizations WHERE name = 'Futuristic HR'
)
LIMIT 1;

-- ========================================
-- STEP 3: Check Existing Subscription
-- ========================================

-- Try different possible subscription table names
WITH existing_sub AS (
  SELECT id, plan_type, status FROM subscription WHERE organization_id = [org_id]
),
subscriptions AS (
  SELECT id, plan_type, status FROM subscription WHERE organization_id = [org_id]
)
SELECT id, plan_type, status 
FROM (
  SELECT id, plan_type, status FROM subscription WHERE organization_id = [org_id]
  UNION ALL
  SELECT id, plan_type, status FROM subscription WHERE organization_id = [org_id]
)
LIMIT 1;

-- ========================================
-- STEP 4: Add PRO Subscription
-- ========================================

-- Insert new PRO subscription
INSERT INTO subscription (
  organization_id,
  user_id,
  plan_type,
  status,
  current_period_start,
  current_period_end,
  trial_end,
  created_at,
  updated_at
) 
SELECT 
  [org_id],                    -- organization_id from STEP 2
  [user_id],                    -- user_id from STEP 1
  'pro',                         -- plan_type: PRO plan
  'active',                      -- status: active immediately
  NOW(),                         -- current_period_start: current time
  NULL,                          -- current_period_end: NULL for pro (no expiry)
  NULL,                          -- trial_end: NULL for pro
  NOW(),                         -- created_at: current time
  NOW()                          -- updated_at: current time
);

-- ========================================
-- ALTERNATIVE: Update Existing Subscription
-- ========================================

-- If there's an existing subscription and you want to update it:

UPDATE subscription 
SET 
  plan_type = 'pro',
  status = 'active',
  current_period_start = NOW(),
  current_period_end = NULL,
  trial_end = NULL,
  updated_at = NOW()
WHERE organization_id = [org_id];

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Verify the subscription was added
SELECT * FROM subscription 
WHERE organization_id = [org_id] 
  AND plan_type = 'pro' 
  AND status = 'active'
ORDER BY created_at DESC;

-- ========================================
-- INSTRUCTIONS
-- ========================================

-- 1. Run the diagnostic script first to find your actual table names
-- 2. Replace [org_id] and [user_id] with the actual IDs from the results
-- 3. Run this script in your Supabase SQL Editor
-- 4. If you get table name errors, check the diagnostic results

-- COMMON TABLE NAME VARIATIONS:
-- users / auth.users / profiles
-- organization / organizations
-- subscription / subscriptions
-- interviews / interview
-- jobs / job

-- ========================================
-- TROUBLESHOOTING
-- ========================================

-- If you get "relation does not exist" errors:
-- 1. Check table names using diagnostic script
-- 2. Update table names in this script
-- 3. Make sure you're using the correct schema (public)
-- 4. Try the Supabase Dashboard GUI instead of SQL

-- If all else fails:
-- Use the Supabase Dashboard to manually add the subscription
-- Go to Authentication → Users → Find user
-- Go to Database → subscription → Add new record
