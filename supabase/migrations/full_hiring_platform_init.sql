-- Idempotent initialization of Hiring Platform features
-- Safe to run multiple times. Will create tables/enums only if they don't exist.

DO $$
BEGIN
    -- 1. Create Enums
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_hiring_mode') THEN
        CREATE TYPE job_hiring_mode AS ENUM ('resume_screening', 'screening_and_interview', 'full_hiring');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'work_trial_status') THEN
        CREATE TYPE work_trial_status AS ENUM ('pending', 'in_progress', 'submitted', 'reviewing', 'completed', 'failed', 'cancelled');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contract_status') THEN
        CREATE TYPE contract_status AS ENUM ('draft', 'sent', 'signed', 'active', 'terminated', 'completed');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('pending', 'escrow', 'released', 'disputed', 'refunded', 'failed');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_type') THEN
        CREATE TYPE payment_type AS ENUM ('trial_fee', 'contract_salary', 'platform_fee', 'hiring_bounty');
    END IF;

    -- 2. Update Job Table Columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job' AND column_name = 'hiring_mode') THEN
        ALTER TABLE job ADD COLUMN hiring_mode job_hiring_mode DEFAULT 'full_hiring';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job' AND column_name = 'trial_duration_days') THEN
        ALTER TABLE job ADD COLUMN trial_duration_days INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job' AND column_name = 'trial_payment_amount') THEN
        ALTER TABLE job ADD COLUMN trial_payment_amount NUMERIC(10, 2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job' AND column_name = 'budget_min') THEN
        ALTER TABLE job ADD COLUMN budget_min NUMERIC(10, 2);
    END IF;
     IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job' AND column_name = 'budget_max') THEN
        ALTER TABLE job ADD COLUMN budget_max NUMERIC(10, 2);
    END IF;

    -- 3. Update Job Application
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_application' AND column_name = 'screening_result') THEN
        ALTER TABLE job_application ADD COLUMN screening_result JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_application' AND column_name = 'interview_score') THEN
        ALTER TABLE job_application ADD COLUMN interview_score INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_application' AND column_name = 'email') THEN
        ALTER TABLE job_application ADD COLUMN email TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_application' AND column_name = 'phone') THEN
        ALTER TABLE job_application ADD COLUMN phone TEXT;
    END IF;

END $$;

-- 4. Create Tables (IF NOT EXISTS is standard SQL)

CREATE TABLE IF NOT EXISTS work_trial (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    job_application_id TEXT REFERENCES job_application(id),
    employer_id TEXT REFERENCES "user"(id), 
    candidate_id TEXT REFERENCES "user"(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    submission_url TEXT,
    employer_feedback TEXT,
    score INTEGER,
    status work_trial_status DEFAULT 'pending',
    payment_amount NUMERIC(10, 2)
);

CREATE TABLE IF NOT EXISTS contract (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    job_application_id TEXT REFERENCES job_application(id),
    employer_id TEXT REFERENCES "user"(id),
    candidate_id TEXT REFERENCES "user"(id),
    title TEXT,
    content TEXT, -- Markdown or HTML content
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    rate NUMERIC(10, 2),
    rate_period TEXT, -- 'hourly', 'monthly', 'fixed'
    status contract_status DEFAULT 'draft',
    employer_signed_at TIMESTAMP WITH TIME ZONE,
    candidate_signed_at TIMESTAMP WITH TIME ZONE,
    termination_reason TEXT
);

CREATE TABLE IF NOT EXISTS payment_transaction (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    sender_id TEXT REFERENCES "user"(id),
    receiver_id TEXT REFERENCES "user"(id),
    entity_type TEXT, -- 'work_trial', 'contract'
    entity_id TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    type payment_type NOT NULL,
    status payment_status DEFAULT 'pending',
    stripe_payment_id TEXT,
    razorpay_payment_id TEXT,
    escrow_release_date TIMESTAMP WITH TIME ZONE
);

-- 5. Safe Schema Repairs for Missing Columns in New Tables
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contract' AND column_name = 'job_application_id') THEN
        ALTER TABLE contract ADD COLUMN job_application_id TEXT REFERENCES job_application(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'work_trial' AND column_name = 'job_application_id') THEN
        ALTER TABLE work_trial ADD COLUMN job_application_id TEXT REFERENCES job_application(id);
    END IF;

     -- Link Work Trial to Application status flow
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_application' AND column_name = 'current_stage') THEN
        ALTER TABLE job_application ADD COLUMN current_stage TEXT DEFAULT 'applied'; 
    END IF;
END $$;
