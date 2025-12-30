import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

export type Contract = {
  id: string;
  created_at: string;
  job_application_id?: string;
  employer_id: string;
  candidate_id: string;
  title: string;
  content: string;
  start_date?: string;
  end_date?: string;
  rate?: number;
  rate_period?: string;
  status: 'draft' | 'sent' | 'signed' | 'active' | 'terminated' | 'completed';
  employer_signed_at?: string;
  candidate_signed_at?: string;
};

const createContract = async (payload: Partial<Contract>) => {
  const { data, error } = await supabase
    .from("contract")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Contract;
};

const getContractById = async (id: string) => {
  const { data, error } = await supabase
    .from("contract")
    .select(`*, candidate:user!candidate_id(email), employer:user!employer_id(email, organization!organization_id(name))`)
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Contract;
};

const updateContract = async (id: string, payload: Partial<Contract>) => {
  const { data, error } = await supabase
    .from("contract")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Contract;
};

const getContractByApplicationId = async (applicationId: string) => {
  const { data, error } = await supabase
    .from("contract")
    .select(`*, employer:user!employer_id(email, organization!organization_id(name))`)
    .eq("job_application_id", applicationId)
    .single();

  if (error && error.code !== 'PGRST116') { // Ignore not found error
    throw new Error(error.message);
  }

  return data as Contract | null;
};

export const ContractsService = {
  createContract,
  getContractById,
  updateContract,
  getContractByApplicationId,
};
