-- Create enum type for plan
CREATE TYPE plan AS ENUM ('free', 'pro', 'free_trial_over');

-- Create tables
CREATE TABLE organization (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    name TEXT,
    image_url TEXT,
    allowed_responses_count INTEGER,
    plan plan
);

CREATE TABLE "user" (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    email TEXT,
    organization_id TEXT REFERENCES organization(id)
);

CREATE TABLE interviewer (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    agent_id TEXT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    image TEXT NOT NULL,
    audio TEXT,
    empathy INTEGER NOT NULL,
    exploration INTEGER NOT NULL,
    rapport INTEGER NOT NULL,
    speed INTEGER NOT NULL
);

CREATE TABLE interview (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    name TEXT,
    description TEXT,
    objective TEXT,
    organization_id TEXT REFERENCES organization(id),
    user_id TEXT REFERENCES "user"(id),
    interviewer_id INTEGER REFERENCES interviewer(id),
    is_active BOOLEAN DEFAULT true,
    is_anonymous BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    logo_url TEXT,
    theme_color TEXT,
    url TEXT,
    readable_slug TEXT,
    questions JSONB,
    quotes JSONB[],
    insights TEXT[],
    respondents TEXT[],
    question_count INTEGER,
    response_count INTEGER,
    time_duration TEXT
);

CREATE TABLE response (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    interview_id TEXT REFERENCES interview(id),
    name TEXT,
    email TEXT,
    call_id TEXT,
    candidate_status TEXT,
    duration INTEGER,
    details JSONB,
    analytics JSONB,
    is_analysed BOOLEAN DEFAULT false,
    is_ended BOOLEAN DEFAULT false,
    is_viewed BOOLEAN DEFAULT false,
    tab_switch_count INTEGER
);

CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    interview_id TEXT REFERENCES interview(id),
    email TEXT,
    feedback TEXT,
    satisfaction INTEGER
);

-- New enums for enhanced features
CREATE TYPE candidate_status AS ENUM ('pending', 'in_review', 'selected', 'rejected', 'on_hold', 'withdrawn');
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
CREATE TYPE ats_provider AS ENUM ('greenhouse', 'lever', 'workday', 'custom');
CREATE TYPE assessment_type AS ENUM ('coding', 'technical', 'behavioral', 'mixed');

-- Skill assessment and coding challenges
CREATE TABLE skill_assessment (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    interview_id TEXT REFERENCES interview(id),
    title TEXT NOT NULL,
    description TEXT,
    assessment_type assessment_type NOT NULL,
    difficulty_level difficulty_level NOT NULL,
    time_limit INTEGER, -- in minutes
    passing_score INTEGER DEFAULT 70,
    is_active BOOLEAN DEFAULT true,
    instructions TEXT,
    evaluation_criteria JSONB
);

CREATE TABLE coding_challenge (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_assessment_id TEXT REFERENCES skill_assessment(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    starter_code TEXT,
    solution_code TEXT,
    test_cases JSONB,
    language TEXT NOT NULL, -- e.g., 'javascript', 'python', 'java'
    difficulty_level difficulty_level NOT NULL,
    points INTEGER DEFAULT 100,
    order_index INTEGER DEFAULT 0
);

-- Candidate skill assessment results
CREATE TABLE candidate_assessment (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    response_id INTEGER REFERENCES response(id),
    skill_assessment_id TEXT REFERENCES skill_assessment(id),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    score INTEGER,
    max_score INTEGER,
    passed BOOLEAN,
    submission_data JSONB, -- code submissions, answers
    evaluation_details JSONB, -- AI evaluation results
    time_spent INTEGER -- in seconds
);

-- ATS integrations
CREATE TABLE ats_integration (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id TEXT REFERENCES organization(id),
    provider ats_provider NOT NULL,
    api_key TEXT,
    api_url TEXT,
    webhook_url TEXT,
    is_active BOOLEAN DEFAULT true,
    configuration JSONB, -- provider-specific settings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE ats_sync_log (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    ats_integration_id TEXT REFERENCES ats_integration(id),
    response_id INTEGER REFERENCES response(id),
    sync_type TEXT NOT NULL, -- 'candidate_create', 'status_update', 'assessment_result'
    status TEXT NOT NULL, -- 'success', 'failed', 'pending'
    request_data JSONB,
    response_data JSONB,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enhanced candidate management
CREATE TABLE candidate_profile (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    response_id INTEGER REFERENCES response(id) UNIQUE,
    resume_url TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    phone TEXT,
    location TEXT,
    experience_years INTEGER,
    expected_salary TEXT,
    notice_period TEXT,
    skills TEXT[], -- array of skill names
    education JSONB, -- education history
    work_experience JSONB, -- work history
    ai_generated_summary TEXT, -- AI-parsed candidate summary
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Update response table to use new enum
ALTER TABLE response ALTER COLUMN candidate_status TYPE candidate_status USING candidate_status::candidate_status;

-- Status change management tables
CREATE TABLE status_change_request (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    response_id INTEGER REFERENCES response(id),
    new_status candidate_status NOT NULL,
    reason TEXT,
    requested_by TEXT NOT NULL,
    requires_approval BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    rejection_reason TEXT,
    rejected_by TEXT,
    rejected_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE status_change_approval (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    status_change_request_id TEXT REFERENCES status_change_request(id),
    approved_by TEXT NOT NULL,
    approved_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    comments TEXT
);

CREATE TABLE candidate_status_log (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    response_id INTEGER REFERENCES response(id),
    old_status candidate_status,
    new_status candidate_status NOT NULL,
    changed_by TEXT NOT NULL,
    reason TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    is_automatic BOOLEAN DEFAULT false
);
