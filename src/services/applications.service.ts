import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { JobApplication } from "@/types/application";
// import { Job } from "@/types/job";

const supabase = createClientComponentClient();

const createApplication = async (payload: Partial<JobApplication>) => {
  const response = await fetch("/api/applications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create application");
  }

  return await response.json() as JobApplication;
};

const getApplicationsByCandidate = async (candidateId: string) => {
  const { data, error } = await supabase
    .from("job_application")
    .select(`*, job(*, organization(name, image_url))`)
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as JobApplication[];
};

const getApplicationsByJob = async (jobId: string) => {
  const { data, error } = await supabase
    .from("job_application")
    .select(`*, candidate:user(email)`) // Assuming user table has email, join via candidate_id
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as JobApplication[];
};

const updateApplicationStatus = async (id: string, status: string) => {
  const response = await fetch(`/api/applications/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to update status");
  }

  return (await response.json()) as JobApplication;
};

const advanceStage = async (id: string, stage: string) => {
    const { data, error } = await supabase
      .from("job_application")
      .update({ current_stage: stage }) // Ensure migration has run
      .eq("id", id)
      .select()
      .single();
  
    if (error) {
      throw new Error(error.message);
    }
  
    return data as JobApplication;
};

const getApplicationById = async (id: string) => {
  const { data, error } = await supabase
    .from("job_application")
    .select(`*, job(*, organization(name, image_url))`)
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as JobApplication;
};

export const ApplicationsService = {
  createApplication,
  getApplicationsByCandidate,
  getApplicationsByJob,
  updateApplicationStatus,
  advanceStage,
  getApplicationById
};
