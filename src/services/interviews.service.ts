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
  const { error, data } = await supabase
    .from("interview")
    .update({ ...payload })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Interview;
};

const deleteInterview = async (id: string) => {
  const { error, data } = await supabase
    .from("interview")
    .delete()
    .eq("id", id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
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

export const InterviewService = {
  getAllInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
  getAllRespondents,
  createInterview,
  deactivateInterviewsByOrgId,
};
