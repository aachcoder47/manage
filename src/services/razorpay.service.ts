import Razorpay from 'razorpay';

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error('Razorpay credentials are not configured');
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export class RazorpayService {
  /**
   * Create a Razorpay subscription
   */
  static async createSubscription(planKey: string, customerId?: string) {
    try {
      // Map plan keys to Razorpay plan IDs (you'll need to create these in Razorpay dashboard)
      const planIdMap: Record<string, string> = {
        basic: process.env.RAZORPAY_PLAN_BASIC || '',
        pro: process.env.RAZORPAY_PLAN_PRO || '',
        advanced: process.env.RAZORPAY_PLAN_ADVANCED || '',
      };

      const planId = planIdMap[planKey];
      if (!planId) {
        throw new Error(`Invalid plan: ${planKey}`);
      }

      if (planId.includes('xxxxx')) {
        throw new Error(`Plan ID not configured for ${planKey}. Please create the plan in Razorpay Dashboard and update RAZORPAY_PLAN_${planKey.toUpperCase()} in .env.local`);
      }

      const subscription = await razorpay.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        total_count: 12, // 12 months
        ...(customerId && { customer_id: customerId }),
      });

      return subscription;
    } catch (error: any) {
      console.error('Razorpay subscription creation failed:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw new Error(error.error?.description || error.message || 'Failed to create subscription');
    }
  }

  /**
   * Create a Razorpay customer
   */
  static async createCustomer(email: string, name: string, organizationId: string) {
    try {
      const customer = await razorpay.customers.create({
        email,
        name,
        notes: {
          organization_id: organizationId,
        },
      });

      return customer;
    } catch (error: any) {
      console.error('Razorpay customer creation failed:', error);
      throw new Error(error.message || 'Failed to create customer');
    }
  }

  /**
   * Verify Razorpay payment signature
   */
  static verifyPaymentSignature(
    razorpayPaymentId: string,
    razorpaySubscriptionId: string,
    razorpaySignature: string
  ): boolean {
    try {
      const crypto = require('crypto');
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(`${razorpayPaymentId}|${razorpaySubscriptionId}`)
        .digest('hex');

      return generatedSignature === razorpaySignature;
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  /**
   * Cancel a subscription
   */
  static async cancelSubscription(subscriptionId: string) {
    try {
      const subscription = await razorpay.subscriptions.cancel(subscriptionId);
      return subscription;
    } catch (error: any) {
      console.error('Razorpay subscription cancellation failed:', error);
      throw new Error(error.message || 'Failed to cancel subscription');
    }
  }

  /**
   * Fetch subscription details
   */
  static async getSubscription(subscriptionId: string) {
    try {
      const subscription = await razorpay.subscriptions.fetch(subscriptionId);
      return subscription;
    } catch (error: any) {
      console.error('Razorpay subscription fetch failed:', error);
      throw new Error(error.message || 'Failed to fetch subscription');
    }
  }
}
