-- ========================================
-- ROBUST PRO SUBSCRIPTION SCRIPT
-- ========================================
-- This script handles multiple scenarios and provides fallback options
-- Run this in your Supabase SQL Editor

-- ========================================
-- STEP 1: Check if Tables Exist (Diagnostic)
-- ========================================

-- Check if the required tables exist
SELECT 'users' as table_exists 
FROM information_schema.tables 
WHERE table_name = 'users' AND table_schema = 'public'
UNION ALL
SELECT 'organization' as table_exists 
FROM information_schema.tables 
WHERE table_name = 'organization' AND table_schema = 'public'
UNION ALL
SELECT 'subscription' as table_exists 
FROM information_schema.tables 
WHERE table_name = 'subscription' AND table_schema = 'public';

-- If any of these return no rows, the tables don't exist
-- You'll need to create them first or use different table names

-- ========================================
-- STEP 2: Find User ID (Multiple Methods)
-- ========================================

-- Method 1: Try users table
SELECT id as user_id, email 
FROM users 
WHERE email = 'raviisys@gmail.com'
LIMIT 1;

-- Method 2: Try auth.users table (common in Supabase)
SELECT id as user_id, email 
FROM auth.users 
WHERE email = 'raviisys@gmail.com'
LIMIT 1;

-- Method 3: Try profiles table
SELECT id as user_id, email 
FROM profiles 
WHERE email = 'raviisys@gmail.com'
LIMIT 1;

-- Method 4: Try metadata approach
SELECT id as user_id
FROM users 
WHERE raw_user_meta_data->>'email' = 'raviisys@gmail.com'
LIMIT 1;

-- Use the first method that returns a result
-- Take the user_id from the successful query

-- ========================================
-- STEP 3: Find Organization ID (Multiple Methods)
-- ========================================

-- Method 1: Try organization table
SELECT id as org_id, name 
FROM organization 
WHERE name = 'Futuristic HR'
LIMIT 1;

-- Method 2: Try organizations table (plural)
SELECT id as org_id, name 
FROM organizations 
WHERE name = 'Futuristic HR'
LIMIT 1;

-- Method 3: Try case-insensitive search
SELECT id as org_id, name 
FROM organization 
WHERE LOWER(name) = LOWER('Futuristic HR')
LIMIT 1;

-- Use the first method that returns a result
-- Take the org_id from the successful query

-- ========================================
-- STEP 4: Add PRO Subscription (Multiple Approaches)
-- ========================================

-- Approach 1: Direct INSERT (if user and org exist)
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
  [user_id],           -- From Step 2
  [org_id],            -- From Step 3
  'pro',               -- PRO plan
  'active',            -- Active immediately
  NOW(),              -- Start now
  NULL,               -- No expiry for pro
  NULL,               -- No trial for pro
  NOW(),              -- Created now
  NOW()               -- Updated now
);

-- Approach 2: Using CTE (more robust)
WITH user_org AS (
  SELECT 
    u.id as user_id,
    o.id as org_id
  FROM users u
  INNER JOIN organization o ON o.name = 'Futuristic HR'
  WHERE u.email = 'raviisys@gmail.com'
  LIMIT 1
)
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
  user_org.org_id,     -- From CTE
  user_org.user_id,     -- From CTE
  'pro',               -- PRO plan
  'active',            -- Active immediately
  NOW(),              -- Start now
  NULL,               -- No expiry for pro
  NULL,               -- No trial for pro
  NOW(),              -- Created now
  NOW()               -- Updated now
)
FROM user_org;

-- Approach 3: Update existing subscription
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
-- STEP 5: Verification Queries
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
  s.status as subscription_status,
  s.current_period_start as subscription_start,
  s.current_period_end as subscription_end
FROM users u
LEFT JOIN subscription s ON u.id = s.user_id
WHERE u.email = 'raviisys@gmail.com';

-- ========================================
-- INSTRUCTIONS
-- ========================================

-- 1. RUN STEP 1 FIRST to check if tables exist
-- 2. If any table doesn't exist, create it first in Supabase Dashboard
-- 3. RUN STEP 2 to get actual user_id and org_id
-- 4. RUN STEP 4 to add the subscription
-- 5. RUN STEP 5 to verify it worked

-- ========================================
-- COMMON TABLE NAME VARIATIONS:
-- users / auth.users / profiles
-- organization / organizations
-- subscription / subscriptions

-- ========================================
-- TROUBLESHOOTING
-- ========================================

-- If you get "table does not exist" errors:
-- 1. The table names might be different in your project
-- 2. Check your Supabase Dashboard for actual table names
-- 3. Use the diagnostic query results to update this script
-- 4. Make sure you're using the correct schema (public)

-- If you get "syntax error near ON":
-- 1. Check if both tables exist
-- 2. Verify column names in both tables
-- 3. Try using different JOIN syntax
-- 4. Use the Supabase Dashboard GUI as fallback

-- ========================================
-- ALTERNATIVE: MANUAL APPROACH
-- ========================================

-- If all SQL fails, use the Supabase Dashboard:
-- 1. Authentication → Users → Find raviisys@gmail.com
-- 2. Database → subscription → Add new record
-- 3. Set: plan_type = 'pro', status = 'active'
-- 4. Add proper current_period_start and created_at timestamps
