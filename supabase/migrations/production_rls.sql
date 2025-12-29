-- Enable RLS on key tables
ALTER TABLE job ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_application ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_trial ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_assessment ENABLE ROW LEVEL SECURITY;
-- Assessments & Interviews might need policies too
ALTER TABLE skill_assessment ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview ENABLE ROW LEVEL SECURITY;

-- CLEANUP (Drop existing policies to avoid conflicts if re-run)
DROP POLICY IF EXISTS "Public jobs are viewable" ON job;
DROP POLICY IF EXISTS "Employers can manage own jobs" ON job;
DROP POLICY IF EXISTS "Employers can view applications for their jobs" ON job_application;
DROP POLICY IF EXISTS "Candidates can view their own applications" ON job_application;
DROP POLICY IF EXISTS "Candidates can create applications" ON job_application;
DROP POLICY IF EXISTS "Employers can update application status" ON job_application;
DROP POLICY IF EXISTS "Employers can view trials" ON work_trial;
DROP POLICY IF EXISTS "Candidates can view trials" ON work_trial;
DROP POLICY IF EXISTS "Employers can manage trials" ON work_trial;
DROP POLICY IF EXISTS "Candidates can update trials" ON work_trial;
DROP POLICY IF EXISTS "Employers can manage contracts" ON contract;
DROP POLICY IF EXISTS "Candidates can view contracts" ON contract;
DROP POLICY IF EXISTS "Candidates can sign contracts" ON contract;
DROP POLICY IF EXISTS "Candidates can view their own assessments" ON candidate_assessment;
DROP POLICY IF EXISTS "Employers can view assessments for their jobs" ON candidate_assessment;

-- JOB POLICIES
CREATE POLICY "Public jobs are viewable" ON job
FOR SELECT USING (
  status = 'open' OR auth.uid() = employer_id
);

CREATE POLICY "Employers can manage own jobs" ON job
FOR ALL USING (
  auth.uid() = employer_id
);

-- JOB APPLICATION POLICIES
CREATE POLICY "Employers can view applications for their jobs" ON job_application
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM job 
    WHERE job.id = job_application.job_id 
    AND job.employer_id = auth.uid()
  )
);

CREATE POLICY "Candidates can view their own applications" ON job_application
FOR SELECT USING (
  auth.uid() = candidate_id
);

CREATE POLICY "Candidates can create applications" ON job_application
FOR INSERT WITH CHECK (
  auth.uid() = candidate_id
);

CREATE POLICY "Employers can update application status" ON job_application
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM job 
    WHERE job.id = job_application.job_id 
    AND job.employer_id = auth.uid()
  )
);

-- WORK TRIAL POLICIES
CREATE POLICY "Employers can view trials" ON work_trial
FOR SELECT USING (
  auth.uid() = employer_id
);

CREATE POLICY "Candidates can view trials" ON work_trial
FOR SELECT USING (
  auth.uid() = candidate_id
);

CREATE POLICY "Employers can manage trials" ON work_trial
FOR ALL USING (
  auth.uid() = employer_id
);

CREATE POLICY "Candidates can update trials" ON work_trial
FOR UPDATE USING (
  auth.uid() = candidate_id
);

-- CONTRACT POLICIES
CREATE POLICY "Employers can manage contracts" ON contract
FOR ALL USING (
  auth.uid() = employer_id
);

CREATE POLICY "Candidates can view contracts" ON contract
FOR SELECT USING (
  auth.uid() = candidate_id
);

CREATE POLICY "Candidates can sign contracts" ON contract
FOR UPDATE USING (
  auth.uid() = candidate_id
);

-- ASSESSMENT POLICIES (Read Only for Client, Write via Service API)
-- Candidate view own
CREATE POLICY "Candidates can view their own assessments" ON candidate_assessment
FOR SELECT USING (
  EXISTS (
     SELECT 1 FROM job_application 
     WHERE job_application.id = candidate_assessment.job_application_id 
     AND job_application.candidate_id = auth.uid()
  )
);

-- Employer view
CREATE POLICY "Employers can view assessments for their jobs" ON candidate_assessment
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM job_application
    JOIN job ON job.id = job_application.job_id
    WHERE job_application.id = candidate_assessment.job_application_id
    AND job.employer_id = auth.uid()
  )
);

-- SKILL ASSESSMENT / INTERVIEW (Public Read mostly for taking? or restricted?)
-- Assuming assessments are public to read if they have the link? Or protected?
-- For now, let's allow read access to authenticated users to view assessments they need to take.
-- Or just public read?
CREATE POLICY "Assessments are viewable" ON skill_assessment
FOR SELECT USING (true); -- Simplify for now, maybe restrict to created_by employer later.

CREATE POLICY "Employers manage assessments" ON skill_assessment
FOR ALL USING (auth.uid() = created_by);

