-- ========================================
-- SIMPLE PRO SUBSCRIPTION SCRIPT
-- ========================================
-- This script uses proper SQL syntax with parameters
-- Run this in your Supabase SQL Editor

-- ========================================
-- STEP 1: Find User ID for raviisys@gmail.com
-- ========================================

-- Find user in users table (most common name)
SELECT id as user_id 
FROM users 
WHERE email = 'raviisys@gmail.com';

-- Alternative: Try auth.users if users doesn't exist
-- SELECT id as user_id 
-- FROM auth.users 
-- WHERE email = 'raviisys@gmail.com';

-- Alternative: Try profiles if others don't exist
-- SELECT id as user_id 
-- FROM profiles 
-- WHERE email = 'raviisys@gmail.com';

-- Take the user_id from the first query that returns a result

-- ========================================
-- STEP 2: Find Organization ID for 'Futuristic HR'
-- ========================================

-- Find organization in organization table (most common name)
SELECT id as org_id 
FROM organization 
WHERE name = 'Futuristic HR';

-- Alternative: Try organizations if organization doesn't exist
-- SELECT id as org_id 
-- FROM organizations 
-- WHERE name = 'Futuristic HR';

-- Take the org_id from the first query that returns a result

-- ========================================
-- STEP 3: Check Existing Subscription
-- ========================================

-- Check if user already has a subscription
SELECT id, plan_type, status 
FROM subscription 
WHERE organization_id = [org_id];

-- If there's an existing subscription, you might want to update it instead
-- See STEP 5 for update queries

-- ========================================
-- STEP 4: Add PRO Subscription
-- ========================================

-- First, create a CTE (Common Table Expression) with the user and org
WITH user_org AS (
  SELECT 
    u.id as user_id,
    o.id as org_id
  FROM users u
  CROSS JOIN organization o ON o.name = 'Futuristic HR'
  WHERE u.email = 'raviisys@gmail.com'
  LIMIT 1
)

-- Insert new PRO subscription using the CTE
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
  user_org.org_id,     -- organization_id
  user_org.user_id,     -- user_id
  'pro',               -- plan_type: PRO plan
  'active',            -- status: active immediately
  NOW(),              -- current_period_start: current time
  NULL,               -- current_period_end: NULL for pro (no expiry)
  NULL,               -- trial_end: NULL for pro
  NOW(),              -- created_at: current time
  NOW()               -- updated_at: current time
)
FROM user_org;

-- ========================================
-- STEP 5: Update Existing Subscription (Alternative)
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

-- Check user's current subscription status
SELECT 
  u.email as user_email,
  u.id as user_id,
  s.plan_type as current_plan,
  s.status as subscription_status
FROM users u
LEFT JOIN subscription s ON u.id = s.user_id
WHERE u.email = 'raviisys@gmail.com';

-- ========================================
-- INSTRUCTIONS
-- ========================================

-- 1. FIRST: Find your actual table names
-- Run: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
-- Replace table names in this script if different

-- 2. SECOND: Find actual user and organization IDs
-- Run the user lookup query and organization lookup query
-- Replace [org_id] and [user_id] in the INSERT statement with actual IDs

-- 3. THIRD: Run the INSERT query
-- Execute the subscription insertion query

-- 4. FOUR: Verify results
-- Run the verification query to confirm it worked

-- ========================================
-- TABLE NAME VARIATIONS TO TRY:
-- users / auth.users / profiles
-- organization / organizations
-- subscription / subscriptions

-- ========================================
-- TROUBLESHOOTING
-- ========================================

-- If you get "table does not exist" errors:
-- 1. Try the alternative table names in the SELECT queries
-- 2. Make sure you're using the correct schema (public)
-- 3. Check that the user and organization actually exist
-- 4. Use the Supabase Dashboard GUI as a fallback

-- COMMON SQL ERRORS TO AVOID:
-- - Using [brackets] for identifiers (use proper parameters)
-- - Missing quotes around string values
-- - Wrong table or column names
-- - Syntax errors in CTE definitions
