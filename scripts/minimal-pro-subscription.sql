-- ========================================
-- MINIMAL PRO SUBSCRIPTION SCRIPT
-- ========================================
-- Simple approach that avoids complex JOINs

-- ========================================
-- STEP 1: Get User ID
-- ========================================

-- Try the most common table name first
SELECT id as user_id 
FROM users 
WHERE email = 'raviisys@gmail.com'
LIMIT 1;

-- Alternative if users doesn't exist
-- SELECT id as user_id 
FROM auth.users 
WHERE email = 'raviisys@gmail.com'
LIMIT 1;

-- Alternative if auth.users doesn't exist
-- SELECT id as user_id 
FROM profiles 
WHERE email = 'raviisys@gmail.com'
LIMIT 1;

-- Store the result (you'll use this in the next step)
-- Let's assume we get: 12345678-1234-1234-1234-1234

-- ========================================
-- STEP 2: Get Organization ID
-- ========================================

-- Try the most common table name first
SELECT id as org_id 
FROM organization 
WHERE name = 'Futuristic HR'
LIMIT 1;

-- Alternative if organization doesn't exist
-- SELECT id as org_id 
FROM organizations 
WHERE name = 'Futuristic HR'
LIMIT 1;

-- Alternative: Try case-insensitive search
SELECT id as org_id 
FROM organization 
WHERE LOWER(name) = LOWER('Futuristic HR')
LIMIT 1;

-- Store the result (you'll use this in the next step)
-- Let's assume we get: 87654321-9876-5432-1098

-- ========================================
-- STEP 3: Add PRO Subscription (Simple INSERT)
-- ========================================

-- Simple direct INSERT - no complex CTEs or JOINs
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
  87654321-9876-5432-1098,  -- organization_id from Step 2
  12345678-1234-1234-1234-1234,  -- user_id from Step 1
  'pro',                         -- plan_type: PRO plan
  'active',                      -- status: active immediately
  NOW(),                         -- current_period_start: current time
  NULL,                          -- current_period_end: NULL for pro (no expiry)
  NULL,                          -- trial_end: NULL for pro
  NOW(),                         -- created_at: current time
  NOW();                         -- updated_at: current time
);

-- ========================================
-- STEP 4: Verification
-- ========================================

-- Verify the subscription was added
SELECT * FROM subscription 
WHERE organization_id = 87654321-9876-5432-1098 
  AND plan_type = 'pro' 
  AND status = 'active'
ORDER BY created_at DESC;

-- ========================================
-- INSTRUCTIONS
-- ========================================

-- 1. Run each step separately in Supabase SQL Editor
-- 2. If Step 1 fails, try the alternative user lookup methods
-- 3. If Step 2 fails, try the alternative organization lookup methods
-- 4. Replace the IDs in Step 3 with actual results from Steps 1 & 2
-- 5. If Step 3 fails, check if tables exist using diagnostic script

-- ========================================
-- TROUBLESHOOTING
-- ========================================

-- If you get "table does not exist" errors:
-- The table names in your Supabase project might be different
-- Check your Supabase Dashboard for actual table names
-- Common alternatives: 'auth' instead of 'auth.users', 'orgs' instead of 'organization'

-- If you get "syntax error" errors:
-- Make sure you're using the correct table and column names
-- Check for typos in table names
-- Ensure you're using the correct schema (public)

-- ========================================
-- BACKUP PLAN: Supabase Dashboard
-- ========================================

-- If all SQL fails, use the Supabase Dashboard:
-- 1. Table Editor → Find user 'raviisys@gmail.com'
-- 2. Authentication → Users → Note the user ID
-- 3. Database → subscription → Add new record
-- 4. Set: plan_type = 'pro', status = 'active'
-- 5. Add proper timestamps
