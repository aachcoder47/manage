import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Response } from "@/types/response";

const supabase = createClientComponentClient();

const createResponse = async (payload: any) => {
  const { error, data } = await supabase
    .from("response")
    .insert({ ...payload })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data?.id;
};

const saveResponse = async (payload: any, call_id: string) => {
  const { error, data } = await supabase
    .from("response")
    .update({ ...payload })
    .eq("call_id", call_id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const getAllResponses = async (interviewId: string) => {
  const { data, error } = await supabase
    .from("response")
    .select(`*`)
    .eq("interview_id", interviewId)
    .or(`details.is.null, details->call_analysis.not.is.null`)
    .eq("is_ended", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as Response[];
};

const getResponseCountByOrganizationId = async (
  organizationId: string,
): Promise<number> => {
  const { count, error } = await supabase
    .from("interview")
    .select("response(id)", { count: "exact", head: true }) // join + count
    .eq("organization_id", organizationId);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
};

const getAllEmailAddressesForInterview = async (interviewId: string) => {
  const { data, error } = await supabase
    .from("response")
    .select(`email`)
    .eq("interview_id", interviewId);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

const getResponseByCallId = async (id: string) => {
  const { data, error } = await supabase
    .from("response")
    .select(`*`)
    .filter("call_id", "eq", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Response;
};

const deleteResponse = async (id: string) => {
  const { error, data } = await supabase
    .from("response")
    .delete()
    .eq("call_id", id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const updateResponse = async (payload: any, call_id: string) => {
  const { error, data } = await supabase
    .from("response")
    .update({ ...payload })
    .eq("call_id", call_id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const ResponseService = {
  createResponse,
  saveResponse,
  updateResponse,
  getAllResponses,
  getResponseByCallId,
  deleteResponse,
  getResponseCountByOrganizationId,
  getAllEmails: getAllEmailAddressesForInterview,
};
