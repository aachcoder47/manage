import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

export type WorkTrial = {
  id: string;
  created_at: string;
  job_application_id?: string;
  employer_id: string;
  candidate_id?: string;
  title: string;
  description: string;
  start_date?: string;
  due_date?: string;
  submission_url?: string;
  employer_feedback?: string;
  score?: number;
  status: 'pending' | 'in_progress' | 'submitted' | 'reviewing' | 'completed' | 'failed' | 'cancelled';
  payment_amount?: number;
};

const createTrial = async (payload: Partial<WorkTrial>) => {
  const { data, error } = await supabase
    .from("work_trial")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as WorkTrial;
};

const getTrialsByEmployer = async (employerId: string) => {
  const { data, error } = await supabase
    .from("work_trial")
    .select(`*, candidate:user!candidate_id(email)`) // Assuming user table relation
    .eq("employer_id", employerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as WorkTrial[];
};

const getTrialsByCandidate = async (candidateId: string) => {
  const { data, error } = await supabase
    .from("work_trial")
    .select(`*, employer:user!employer_id(email)`)
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as WorkTrial[];
};

const updateTrial = async (id: string, payload: Partial<WorkTrial>) => {
  const { data, error } = await supabase
    .from("work_trial")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as WorkTrial;
};

const getTrialByApplicationId = async (applicationId: string) => {
  const { data, error } = await supabase
    .from("work_trial")
    .select(`*, employer:user!employer_id(email, organization!organization_id(name))`)
    .eq("job_application_id", applicationId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message);
  }

  return data as WorkTrial | null;
};

export const TrialsService = {
  createTrial,
  getTrialsByEmployer,
  getTrialsByCandidate,
  updateTrial,
  getTrialByApplicationId,
};
