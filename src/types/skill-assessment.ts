export enum CandidateStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  SELECTED = 'selected',
  REJECTED = 'rejected',
  ON_HOLD = 'on_hold',
  WITHDRAWN = 'withdrawn'
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum AssessmentType {
  CODING = 'coding',
  TECHNICAL = 'technical',
  BEHAVIORAL = 'behavioral',
  MIXED = 'mixed'
}

export enum ATSProvider {
  GREENHOUSE = 'greenhouse',
  LEVER = 'lever',
  WORKDAY = 'workday',
  CUSTOM = 'custom'
}

export interface SkillAssessment {
  id: string;
  created_at: Date;
  interview_id: string;
  title: string;
  description?: string;
  assessment_type: AssessmentType;
  difficulty_level: DifficultyLevel;
  time_limit?: number; // in minutes
  passing_score: number;
  is_active: boolean;
  instructions?: string;
  evaluation_criteria?: Record<string, any>;
}

export interface CodingChallenge {
  id: string;
  skill_assessment_id: string;
  title: string;
  description: string;
  starter_code?: string;
  solution_code?: string;
  test_cases: TestCase[];
  language: string;
  difficulty_level: DifficultyLevel;
  points: number;
  order_index: number;
}

export interface TestCase {
  input: any;
  expected_output: any;
  description?: string;
  is_hidden?: boolean;
}

export interface CandidateAssessment {
  id: string;
  created_at: Date;
  response_id: number;
  skill_assessment_id: string;
  started_at?: Date;
  completed_at?: Date;
  score?: number;
  max_score?: number;
  passed?: boolean;
  submission_data?: Record<string, any>;
  evaluation_details?: EvaluationDetails;
  time_spent?: number; // in seconds
}

export interface EvaluationDetails {
  code_quality: number;
  correctness: number;
  efficiency: number;
  best_practices: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  test_results: TestResult[];
}

export interface TestResult {
  test_case: TestCase;
  passed: boolean;
  actual_output?: any;
  error_message?: string;
  execution_time?: number;
}

export interface ATSIntegration {
  id: string;
  organization_id: string;
  provider: ATSProvider;
  api_key?: string;
  api_url?: string;
  webhook_url?: string;
  is_active: boolean;
  configuration?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface ATSSyncLog {
  id: string;
  ats_integration_id: string;
  response_id: number;
  sync_type: string;
  status: string;
  request_data?: Record<string, any>;
  response_data?: Record<string, any>;
  error_message?: string;
  created_at: Date;
}

export interface CandidateProfile {
  id: string;
  response_id: number;
  resume_url?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  phone?: string;
  location?: string;
  experience_years?: number;
  expected_salary?: string;
  notice_period?: string;
  skills: string[];
  education?: Education[];
  work_experience?: WorkExperience[];
  ai_generated_summary?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  start_date: string;
  end_date?: string;
  gpa?: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  start_date: string;
  end_date?: string;
  description: string;
  technologies?: string[];
}

export interface CodeSubmission {
  challenge_id: string;
  code: string;
  language: string;
  submitted_at: Date;
}

export interface AssessmentResult {
  candidate_assessment_id: string;
  overall_score: number;
  max_score: number;
  passed: boolean;
  detailed_feedback: string;
  recommendations: string[];
  skill_scores: Record<string, number>;
}

export interface FilterCriteria {
  minScore?: number;
  maxScore?: number;
  skills?: string[];
  experienceYears?: {
    min?: number;
    max?: number;
  };
  location?: string[];
  status?: CandidateStatus[];
  assessmentType?: string[];
  difficultyLevel?: string[];
  timeSpent?: {
    min?: number;
    max?: number;
  };
}
