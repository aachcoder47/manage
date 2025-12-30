import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Interview } from "@/types/interview";

const supabase = createClientComponentClient();

const getAllInterviews = async (userId: string, organizationId: string) => {
  const { data: clientData, error: clientError } = await supabase
    .from("interview")
    .select(`*`)
    .or(`organization_id.eq.${organizationId},user_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (clientError) {
    throw new Error(clientError.message);
  }

  return (clientData || []) as Interview[];
};

const getInterviewById = async (id: string) => {
  const { data, error } = await supabase
    .from("interview")
    .select(`*`)
    .or(`id.eq.${id},readable_slug.eq.${id}`)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Interview;
};

const updateInterview = async (payload: Partial<Interview>, id: string) => {
  const response = await fetch(`/api/interviews/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to update interview");
  }

  return (await response.json()) as Interview;
};

const deleteInterview = async (id: string) => {
  const response = await fetch(`/api/interviews/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to delete interview");
  }

  return await response.json();
};

const getAllRespondents = async (interviewId: string) => {
  const { data, error } = await supabase
    .from("interview")
    .select(`respondents`)
    .eq("interview_id", interviewId);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

const createInterview = async (payload: any) => {
  const { error, data } = await supabase
    .from("interview")
    .insert({ ...payload })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Interview;
};

const deactivateInterviewsByOrgId = async (organizationId: string) => {
  const { error } = await supabase
    .from("interview")
    .update({ is_active: false })
    .eq("organization_id", organizationId)
    .eq("is_active", true);

  if (error) {
    throw new Error(error.message);
  }
};

const getInterviewsByJobId = async (jobId: string) => {
  const { data, error } = await supabase
    .from("interview")
    .select(`*`)
    .eq("job_id", jobId);

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as Interview[];
};

export const InterviewService = {
  getAllInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
  getAllRespondents,
  createInterview,
  deactivateInterviewsByOrgId,
  getInterviewsByJobId,
};
