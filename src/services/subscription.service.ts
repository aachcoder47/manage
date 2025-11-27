import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export interface Subscription {
  id: string;
  organization_id: string;
  plan_type: 'free' | 'basic' | 'pro' | 'advanced' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired';
  razorpay_subscription_id?: string;
  razorpay_customer_id?: string;
  current_period_start?: Date;
  current_period_end?: Date;
  created_at: Date;
  updated_at: Date;
}

export class SubscriptionService {
  /**
   * Get subscription by organization ID
   */
  static async getSubscriptionByOrgId(organizationId: string): Promise<Subscription | null> {
    const supabase = createClientComponentClient();
    const { data, error } = await supabase
      .from('subscription')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Create a new subscription
   */
  static async createSubscription(subscription: Partial<Subscription>): Promise<Subscription> {
    const supabase = createClientComponentClient();
    const { data, error } = await supabase
      .from('subscription')
      .insert([subscription])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Update subscription
   */
  static async updateSubscription(
    organizationId: string,
    updates: Partial<Subscription>
  ): Promise<Subscription> {
    const supabase = createClientComponentClient();
    const { data, error } = await supabase
      .from('subscription')
      .update({ ...updates, updated_at: new Date() })
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Check if organization can create more interviews
   */
  static async canCreateInterview(organizationId: string): Promise<boolean> {
    let subscription = await this.getSubscriptionByOrgId(organizationId);
    
    // If no subscription exists, create a free one
    if (!subscription) {
      try {
        subscription = await this.createSubscription({
          organization_id: organizationId,
          plan_type: 'free',
          status: 'active',
        });
      } catch (error) {
        console.error('Failed to create free subscription:', error);
        // If subscription creation fails (table doesn't exist), allow the first interview anyway
        return true;
      }
    }
    
    // Check if subscription is active
    if (subscription.status !== 'active') {
      return false;
    }

    // Get interview limits from config
    const { PRICING_PLANS } = await import('@/config/pricing.config');
    const plan = PRICING_PLANS[subscription.plan_type];
    
    if (plan.interviews === -1) {
      return true; // Unlimited
    }

    // Count interviews created this month
    const supabase = createClientComponentClient();
    const { count, error } = await supabase
      .from('interview')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

    if (error) {
      console.error('Error counting interviews:', error);
      // If we can't count, allow creation (fail open)
      return true;
    }

    return (count || 0) < plan.interviews;
  }

  /**
   * Get interview count for current month
   */
  static async getMonthlyInterviewCount(organizationId: string): Promise<number> {
    const supabase = createClientComponentClient();
    const { count, error } = await supabase
      .from('interview')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

    if (error) {
      throw new Error(error.message);
    }

    return count || 0;
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(organizationId: string): Promise<Subscription> {
    return this.updateSubscription(organizationId, {
      status: 'cancelled',
    });
  }
}
