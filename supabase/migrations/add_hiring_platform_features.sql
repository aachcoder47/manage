-- Extended Migration for Full Hiring Platform

-- Enums for new features
CREATE TYPE job_hiring_mode AS ENUM ('resume_screening', 'screening_and_interview', 'full_hiring');
CREATE TYPE work_trial_status AS ENUM ('pending', 'in_progress', 'submitted', 'reviewing', 'completed', 'failed', 'cancelled');
CREATE TYPE contract_status AS ENUM ('draft', 'sent', 'signed', 'active', 'terminated', 'completed');
CREATE TYPE payment_status AS ENUM ('pending', 'escrow', 'released', 'disputed', 'refunded', 'failed');
CREATE TYPE payment_type AS ENUM ('trial_fee', 'contract_salary', 'platform_fee', 'hiring_bounty');

-- Update Job Table
ALTER TABLE job ADD COLUMN hiring_mode job_hiring_mode DEFAULT 'full_hiring';
ALTER TABLE job ADD COLUMN trial_duration_days INTEGER;
ALTER TABLE job ADD COLUMN trial_payment_amount NUMERIC(10, 2);
ALTER TABLE job ADD COLUMN budget_min NUMERIC(10, 2);
ALTER TABLE job ADD COLUMN budget_max NUMERIC(10, 2);

-- Update Job Application
ALTER TABLE job_application ADD COLUMN screening_result JSONB; -- Store AI analysis
ALTER TABLE job_application ADD COLUMN interview_score INTEGER;

-- Work Trials Table
CREATE TABLE work_trial (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    job_application_id TEXT REFERENCES job_application(id),
    employer_id TEXT REFERENCES "user"(id), -- or organization
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

-- Contracts Table
CREATE TABLE contract (
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

-- Payments Table (Escrow/Direct)
CREATE TABLE payment_transaction (
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

-- Link Work Trial to Application status flow
ALTER TABLE job_application ADD COLUMN current_stage TEXT DEFAULT 'applied'; -- 'screening', 'interview', 'trial', 'offer', 'hired'

