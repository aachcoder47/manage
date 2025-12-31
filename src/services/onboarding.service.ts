import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export type OnboardingItem = {
    id: string;
    package_id: string;
    title: string;
    description?: string;
    resource_url?: string;
    item_type: 'document' | 'credential' | 'task' | 'link';
    is_completed: boolean;
};

export type OnboardingPackage = {
    id: string;
    created_at: string;
    contract_id: string;
    employer_id: string;
    candidate_id: string;
    welcome_message: string;
    status: 'draft' | 'sent';
    items?: OnboardingItem[];
};

const supabase = createClientComponentClient();

const createPackage = async (payload: Partial<OnboardingPackage>) => {
  const { data, error } = await supabase
    .from("onboarding_package")
    .insert(payload)
    .select()
    .single();

  if (error) {throw new Error(error.message);}
  return data as OnboardingPackage;
};

const getPackageByContract = async (contractId: string) => {
    const { data, error } = await supabase
    .from("onboarding_package")
    .select(`*, items:onboarding_item(*)`)
    .eq("contract_id", contractId)
    .single();

  if (error && error.code !== 'PGRST116') {throw new Error(error.message);} // Ignore not found
  return data as OnboardingPackage | null;
};

const getPackageById = async (id: string) => {
    const { data, error } = await supabase
    .from("onboarding_package")
    .select(`*, items:onboarding_item(*)`)
    .eq("id", id)
    .single();

  if (error) {throw new Error(error.message);}
  return data as OnboardingPackage;
};

const addItem = async (payload: Partial<OnboardingItem>) => {
    const { data, error } = await supabase
    .from("onboarding_item")
    .insert(payload)
    .select()
    .single();

  if (error) {throw new Error(error.message);}
  return data as OnboardingItem;
};

const deleteItem = async (id: string) => {
    const { error } = await supabase
    .from("onboarding_item")
    .delete()
    .eq("id", id);
  if (error) {throw new Error(error.message);}
};

const updatePackageStatus = async (id: string, status: string) => {
    const { data, error } = await supabase
    .from("onboarding_package")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
    if (error) {throw new Error(error.message);}
    return data;
};

const toggleItemCompletion = async (id: string, is_completed: boolean) => {
    const { data, error } = await supabase
    .from("onboarding_item")
    .update({ is_completed })
    .eq("id", id)
    .select()
    .single();
    if (error) {throw new Error(error.message);}
    return data;
};

export const OnboardingService = {
  createPackage,
  getPackageByContract,
  getPackageById,
  addItem,
  deleteItem,
  updatePackageStatus,
  toggleItemCompletion
};
