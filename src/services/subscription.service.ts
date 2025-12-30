
import { createClient } from "@supabase/supabase-js";
import { PRICING_PLANS } from "@/config/pricing.config";

export type SubscriptionPlanType = "free" | "basic" | "pro" | "advanced" | "enterprise";
export type SubscriptionStatus = "active" | "cancelled" | "expired" | "trial" | "pending";

export type Subscription = {
  id: string;
  organization_id: string;
  plan_type: SubscriptionPlanType;
  status: SubscriptionStatus;
  razorpay_subscription_id?: string | null;
  razorpay_customer_id?: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
  trial_end?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type CreateSubscriptionInput = {
  organization_id: string;
  plan_type: SubscriptionPlanType;
  status: SubscriptionStatus;
  razorpay_subscription_id?: string | null;
  razorpay_customer_id?: string | null;
  current_period_start?: Date | string | null;
  current_period_end?: Date | string | null;
  trial_end?: Date | string | null;
};

type UpdateSubscriptionInput = Partial<Omit<CreateSubscriptionInput, "organization_id">>;

function getServiceSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing Supabase service credentials");
  }

  return createClient(supabaseUrl, serviceKey);
}

async function getBrowserSupabase() {
  const mod = await import("@supabase/auth-helpers-nextjs");
  return mod.createClientComponentClient();
}

function toIso(value: Date | string | null | undefined) {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.toISOString();
}

function startOfCurrentMonth() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
}

const getSubscriptionByOrgId = async (organizationId: string): Promise<Subscription | null> => {
  const isServer = typeof window === "undefined";
  const supabase = isServer ? getServiceSupabase() : await getBrowserSupabase();

  const { data, error } = await supabase
    .from("subscription")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  const first = (data as Subscription[] | null)?.[0];
  return first || null;
};

const createSubscription = async (payload: CreateSubscriptionInput): Promise<Subscription> => {
  const supabase = getServiceSupabase();

  const insertPayload: any = {
    organization_id: payload.organization_id,
    plan_type: payload.plan_type,
    status: payload.status,
    razorpay_subscription_id: payload.razorpay_subscription_id ?? null,
    razorpay_customer_id: payload.razorpay_customer_id ?? null,
    current_period_start: toIso(payload.current_period_start ?? null),
    current_period_end: toIso(payload.current_period_end ?? null),
    trial_end: toIso(payload.trial_end ?? null),
  };

  const { data, error } = await supabase
    .from("subscription")
    .insert(insertPayload)
    .select()
    .limit(1);

  if (error) {
    const retryPayload = { ...insertPayload };
    delete retryPayload.trial_end;
    const retry = await supabase.from("subscription").insert(retryPayload).select().limit(1);
    if (retry.error) {
      throw new Error(retry.error.message);
    }
    const first = (retry.data as Subscription[] | null)?.[0];
    if (!first) {
      throw new Error("Failed to create subscription");
    }
    return first;
  }

  const first = (data as Subscription[] | null)?.[0];
  if (!first) {
    throw new Error("Failed to create subscription");
  }
  return first;
};

const updateSubscription = async (organizationId: string, updates: UpdateSubscriptionInput): Promise<Subscription> => {
  const supabase = getServiceSupabase();

  const updatePayload: any = {
    ...updates,
  };

  if (updates.current_period_start !== undefined) {
    updatePayload.current_period_start = toIso(updates.current_period_start as any);
  }
  if (updates.current_period_end !== undefined) {
    updatePayload.current_period_end = toIso(updates.current_period_end as any);
  }
  if (updates.trial_end !== undefined) {
    updatePayload.trial_end = toIso(updates.trial_end as any);
  }

  const { data, error } = await supabase
    .from("subscription")
    .update(updatePayload)
    .eq("organization_id", organizationId)
    .select()
    .limit(1);

  if (error) {
    const retryPayload = { ...updatePayload };
    delete retryPayload.trial_end;
    const retry = await supabase
      .from("subscription")
      .update(retryPayload)
      .eq("organization_id", organizationId)
      .select()
      .limit(1);
    if (retry.error) {
      throw new Error(retry.error.message);
    }
    const first = (retry.data as Subscription[] | null)?.[0];
    if (!first) {
      throw new Error("Subscription not found");
    }
    return first;
  }

  const first = (data as Subscription[] | null)?.[0];
  if (!first) {
    throw new Error("Subscription not found");
  }
  return first;
};

const getMonthlyInterviewCount = async (organizationId: string): Promise<number> => {
  const isServer = typeof window === "undefined";
  const supabase = isServer ? getServiceSupabase() : await getBrowserSupabase();

  const fromDate = startOfCurrentMonth().toISOString();
  const { count, error } = await supabase
    .from("interview")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .gte("created_at", fromDate);

  if (error) {
    throw new Error(error.message);
  }

  return count || 0;
};

const canCreateInterview = async (organizationId: string): Promise<boolean> => {
  const subscription = await getSubscriptionByOrgId(organizationId);
  const planKey = (subscription?.plan_type || "free") as string;
  const plan = PRICING_PLANS[planKey] || PRICING_PLANS["free"];

  if (plan.interviews === -1) {
    return true;
  }

  const used = await getMonthlyInterviewCount(organizationId);
  return used < plan.interviews;
};

const createTrialSubscription = async (
  organizationId: string,
  planType: "basic" | "pro" | "advanced",
  _userEmail: string,
  _userName: string
): Promise<Subscription> => {
  const now = new Date();
  const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const existing = await getSubscriptionByOrgId(organizationId);
  if (existing) {
    return updateSubscription(organizationId, {
      plan_type: planType,
      status: "trial",
      current_period_start: now,
      current_period_end: trialEnd,
      trial_end: trialEnd,
    } as any);
  }

  return createSubscription({
    organization_id: organizationId,
    plan_type: planType,
    status: "trial",
    current_period_start: now,
    current_period_end: trialEnd,
    trial_end: trialEnd,
  } as any);
};

const convertTrialToPaid = async (
  organizationId: string,
  razorpaySubscriptionId: string,
  razorpayCustomerId: string,
  _paymentMethodLast4: string,
  _paymentMethodType: string,
  _userEmail: string,
  _userName: string
): Promise<Subscription> => {
  return updateSubscription(organizationId, {
    status: "pending",
    razorpay_subscription_id: razorpaySubscriptionId,
    razorpay_customer_id: razorpayCustomerId,
  });
};

const validateAndProcessPayment = async (organizationId: string) => {
  const subscription = await getSubscriptionByOrgId(organizationId);
  if (!subscription) {
    return { success: false, error: "Subscription not found" };
  }
  return { success: true, subscription };
};

const checkAndSendTrialReminders = async () => {
  return { success: true, processed: 0 };
};

const sendMonthlyUsageReports = async () => {
  return { success: true, processed: 0 };
};

export const SubscriptionService = {
  getSubscriptionByOrgId,
  createSubscription,
  updateSubscription,
  getMonthlyInterviewCount,
  canCreateInterview,
  createTrialSubscription,
  convertTrialToPaid,
  validateAndProcessPayment,
  checkAndSendTrialReminders,
  sendMonthlyUsageReports,
};

