-- SQL Script to Add PRO Subscription for raviisys@gmail.com
-- Run this script directly in your Supabase SQL editor

-- ========================================
-- STEP 1: Find User ID
-- ========================================

-- Find the user ID for raviisys@gmail.com
-- Check both users and auth.users tables

-- First, try users table
SELECT id, email, raw_user_meta_data 
FROM users 
WHERE email = 'raviisys@gmail.com';

-- If not found in users, try auth.users
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE email = 'raviisys@gmail.com';

-- Note: Take the ID from whichever query returns a result
-- Let's assume we found user ID: [USER_ID]

-- ========================================
-- STEP 2: Find Organization ID
-- ========================================

-- Find the organization ID for 'Futuristic HR'
-- Adjust organization name if needed

SELECT id, name 
FROM organization 
WHERE name = 'Futuristic HR';

-- Note: Let's assume we found organization ID: [ORG_ID]

-- ========================================
-- STEP 3: Check Existing Subscription
-- ========================================

-- Check if user already has a subscription
SELECT id, plan_type, status, current_period_start, current_period_end
FROM subscription 
WHERE organization_id = [ORG_ID];

-- If there's an existing subscription, you might want to update it instead
-- See STEP 5 for update queries

-- ========================================
-- STEP 4: Add PRO Subscription
-- ========================================

-- Insert new PRO subscription for the user
INSERT INTO subscription (
  organization_id,
  plan_type,
  status,
  current_period_start,
  current_period_end,
  trial_end,
  created_at,
  updated_at
) VALUES (
  [ORG_ID],                    -- organization_id from STEP 2
  'pro',                         -- plan_type: PRO plan
  'active',                      -- status: active immediately
  NOW(),                         -- current_period_start: current time
  NULL,                          -- current_period_end: NULL for pro (no expiry)
  NULL,                          -- trial_end: NULL for pro
  NOW(),                         -- created_at: current time
  NOW()                          -- updated_at: current time
);

-- ========================================
-- STEP 5: Update Existing Subscription (Optional)
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
WHERE organization_id = [ORG_ID];

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Verify the subscription was added
SELECT * FROM subscription 
WHERE organization_id = [ORG_ID] 
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
LEFT JOIN subscription s ON u.id = s.user_id  -- Note: This assumes user_id in subscription table
WHERE u.email = 'raviisys@gmail.com';

-- ========================================
-- IMPORTANT NOTES
-- ========================================

-- 1. Replace [ORG_ID] with the actual organization ID from STEP 2
-- 2. Replace [USER_ID] with the actual user ID from STEP 1
-- 3. Run these queries in your Supabase SQL editor
-- 4. The PRO plan gives unlimited interviews and all advanced features
-- 5. Make sure to run the queries in order: 1 → 2 → 3 → 4 (or 5 if updating)

-- ========================================
-- ALTERNATIVE: Direct User Assignment
-- ========================================

-- If you have the user ID directly, you can skip the user lookup:

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
  [ORG_ID],                    -- organization_id
  [USER_ID],                    -- user_id (direct assignment)
  'pro',                         -- plan_type: PRO plan
  'active',                      -- status: active immediately
  NOW(),                         -- current_period_start: current time
  NULL,                          -- current_period_end: NULL for pro (no expiry)
  NULL,                          -- trial_end: NULL for pro
  NOW(),                         -- created_at: current time
  NOW()                          -- updated_at: current time
);

-- ========================================
-- FEATURES OF PRO PLAN
-- ========================================

-- The PRO plan typically includes:
-- - Unlimited interviews (interviews: -1)
-- - Advanced AI features
-- - Priority support
-- - Advanced analytics
-- - Custom branding options
-- - API access
-- - Team collaboration features
-- - Export capabilities
