-- Create roles for users
CREATE TYPE user_role AS ENUM ('employer', 'candidate', 'admin');

-- Add role to user table
ALTER TABLE "user" ADD COLUMN role user_role DEFAULT 'employer';

-- Create job table
CREATE TABLE job (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    organization_id TEXT REFERENCES organization(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    location TEXT,
    employment_type TEXT, -- e.g., 'full-time', 'contract', 'freelance'
    salary_range TEXT,
    is_remote BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'open', -- 'open', 'closed', 'draft'
    views INTEGER DEFAULT 0
);

-- Create profile for candidates (separate from specific interview responses)
CREATE TABLE candidate_profile_main (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT REFERENCES "user"(id) UNIQUE,
    full_name TEXT,
    headline TEXT,
    resume_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    skills TEXT[],
    experience_years INTEGER,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create job applications
CREATE TABLE job_application (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    job_id TEXT REFERENCES job(id),
    candidate_id TEXT REFERENCES "user"(id),
    status TEXT DEFAULT 'applied', -- 'applied', 'screening', 'interviewing', 'offer', 'rejected'
    resume_url TEXT, -- snapshot of resume at time of application
    cover_letter TEXT,
    screening_score INTEGER,
    screening_notes TEXT
);

-- Link interviews to jobs (optional, but good for flow)
ALTER TABLE interview ADD COLUMN job_id TEXT REFERENCES job(id);
