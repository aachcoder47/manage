-- SQL Script to Add PRO Subscription for raviisys@gmail.com
-- Run this script directly in your Supabase SQL editor
-- Replace the placeholder values with actual IDs

-- ========================================
-- STEP 1: Find User ID for raviisys@gmail.com
-- ========================================

-- First, try users table
-- Get the user ID - you'll need to replace the result with the actual ID
SELECT id as user_id FROM users WHERE email = 'raviisys@gmail.com';

-- If not found in users, try auth.users table
SELECT id as user_id FROM auth.users WHERE email = 'raviisys@gmail.com';

-- Note: Take the user_id from the result above
-- Let's assume we found: 12345678-1234-1234-1234-1234

-- ========================================
-- STEP 2: Find Organization ID for 'Futuristic HR'
-- ========================================

-- Get the organization ID - you'll need to replace the result with the actual ID
SELECT id as org_id FROM organization WHERE name = 'Futuristic HR';

-- Note: Take the org_id from the result above
-- Let's assume we found: 87654321-9876-5432-1098

-- ========================================
-- STEP 3: Check Existing Subscription
-- ========================================

-- Check if user already has a subscription
SELECT id, plan_type, status, current_period_start, current_period_end
FROM subscription 
WHERE organization_id = 87654321-9876-5432-1098;

-- If there's an existing subscription, you might want to update it instead
-- See STEP 5 for update queries

-- ========================================
-- STEP 4: Add PRO Subscription
-- ========================================

-- Insert new PRO subscription for the user
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
) VALUES (
  87654321-9876-5432-1098,  -- organization_id from STEP 2
  12345678-1234-1234-1234-1234,  -- user_id from STEP 1
  'pro',                         -- plan_type: PRO plan
  'active',                      -- status: active immediately
  NOW(),                         -- current_period_start: current time
  NULL,                          -- current_period_end: NULL for pro (no expiry)
  NULL,                          -- trial_end: NULL for pro
  NOW(),                         -- created_at: current time
  NOW()                          -- updated_at: current time
);

-- ========================================
-- STEP 5: Update Existing Subscription (Alternative)
-- ========================================

-- If there's an existing subscription and you want to update it instead:

UPDATE subscription 
SET 
  plan_type = 'pro',
  status = 'active',
  current_period_start = NOW(),
  current_period_end = NULL,
  trial_end = NULL,
  updated_at = NOW()
WHERE organization_id = 87654321-9876-5432-1098;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Verify the subscription was added
SELECT * FROM subscription 
WHERE organization_id = 87654321-9876-5432-1098 
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
-- IMPORTANT NOTES
-- ========================================

-- 1. Replace the placeholder IDs with actual IDs from your database
-- 2. Run these queries in your Supabase SQL editor
-- 3. The PRO plan gives unlimited interviews (interviews: -1)
-- 4. Make sure to run the queries in order: 1 → 2 → 3 → 4 (or 5 if updating)
-- 5. The PRO plan includes advanced AI features, priority support, and analytics
-- 6. After running, verify the subscription was created successfully

-- ========================================
-- ALTERNATIVE: Using Variables (Supabase doesn't support this)
-- ========================================

-- If your Supabase version supports variables, you could use:

-- Define variables at the top
-- DEFINE USER_ID = '12345678-1234-1234-1234-1234';
-- DEFINE ORG_ID = '87654321-9876-5432-1098';

-- Then use in queries
-- WHERE organization_id = ORG_ID
-- WHERE user_id = USER_ID

-- ========================================
-- TROUBLESHOOTING
-- ========================================

-- If you get syntax errors, make sure:
-- 1. You're using the correct table names (users, auth.users, organization, subscription)
-- 2. The IDs exist in your database
-- 3. You're running the queries in the correct order
-- 4. No extra characters or formatting issues

-- Common issues:
-- - Table names might be different (check your schema)
-- - Column names might be different (check your schema)
-- - User might not exist in the expected table
