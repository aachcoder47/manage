-- Query to add Pro subscription for Sayedrizvi03@gmail.com
-- Run this in the Supabase SQL Editor

DO $$
DECLARE
    v_user_email TEXT := 'Sayedrizvi03@gmail.com';
    v_org_id TEXT;
BEGIN
    -- 1. Find the organization_id from the public.user table
    SELECT organization_id INTO v_org_id
    FROM public.user
    WHERE email = v_user_email
    LIMIT 1;

    -- If not found, raise an explanatory error
    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found in public.user table. Please ensure the user has signed up.', v_user_email;
    END IF;

    RAISE NOTICE 'Found Organization ID: %', v_org_id;

    -- 2. Upsert the subscription
    -- Check if subscription exists for this organization
    IF EXISTS (SELECT 1 FROM public.subscription WHERE organization_id = v_org_id) THEN
        -- UPDATE existing
        UPDATE public.subscription
        SET 
            plan_type = 'pro',
            status = 'active',
            current_period_start = NOW(),
            current_period_end = NOW() + INTERVAL '1 year',
            updated_at = NOW()
        WHERE organization_id = v_org_id;

        RAISE NOTICE 'Updated existing subscription to PRO for % (Org ID: %)', v_user_email, v_org_id;
    ELSE
        -- INSERT new
        INSERT INTO public.subscription (
            organization_id,
            plan_type,
            status,
            current_period_start,
            current_period_end,
            created_at,
            updated_at
        )
        VALUES (
            v_org_id,
            'pro',
            'active',
            NOW(),
            NOW() + INTERVAL '1 year',
            NOW(),
            NOW()
        );

        RAISE NOTICE 'Created new PRO subscription for % (Org ID: %)', v_user_email, v_org_id;
    END IF;
END $$;
