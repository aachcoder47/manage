import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Job } from "@/types/job";

const supabase = createClientComponentClient();

const getAllJobsByOrg = async (organizationId: string) => {
  const { data, error } = await supabase
    .from("job")
    .select(`*`)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as Job[];
};

const getPublicJobs = async () => {
  const { data, error } = await supabase
    .from("job")
    .select(`*, organization(name, image_url)`)
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as Job[];
};

const getJobById = async (id: string) => {
  const { data, error } = await supabase
    .from("job")
    .select(`*, organization(name, image_url)`)
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Job & { organization: { name: string; image_url: string } };
};

const createJob = async (payload: Partial<Job>) => {
  const { data, error } = await supabase
    .from("job")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Job;
};

const updateJob = async (id: string, payload: Partial<Job>) => {
  const { data, error } = await supabase
    .from("job")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Job;
};

const associateInterviewWithJob = async (interviewId: string, jobId: string) => {
  // First unlink any other interviews from this job to maintain 1:1 for simplicity if needed, 
  // or just link this one. User request implies "the" interview.
  await supabase
    .from("interview")
    .update({ job_id: null })
    .eq("job_id", jobId);

  const { data, error } = await supabase
    .from("interview")
    .update({ job_id: jobId })
    .eq("id", interviewId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const unlinkInterviewsFromJob = async (jobId: string) => {
    const { error } = await supabase
        .from("interview")
        .update({ job_id: null })
        .eq("job_id", jobId);
    
    if (error) throw new Error(error.message);
};

export const JobsService = {
  getAllJobsByOrg,
  getPublicJobs,
  getJobById,
  createJob,
  updateJob,
  associateInterviewWithJob,
  unlinkInterviewsFromJob,
};
