import { NextRequest, NextResponse } from 'next/server';
// import { RazorpayService } from '@/services/razorpay.service';
import { SubscriptionService } from '@/services/subscription.service';
import { getAuth } from '@clerk/nextjs/server';
import Razorpay from 'razorpay';

// Temporary inline RazorpayService until file system issues are resolved
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

class RazorpayService {
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
      
      // If customer already exists, try to fetch existing customers and find by email
      if (error.error?.code === 'BAD_REQUEST_ERROR' && error.error?.description?.includes('Customer already exists')) {
        try {
          console.log('Attempting to fetch existing customers for email:', email);
          // Fetch all customers and filter by email (Razorpay API limitation)
          const customers = await razorpay.customers.all();
          
          console.log('Fetched customers response:', customers);
          
          if (customers && customers.items) {
            console.log('Total customers found:', customers.items.length);
            console.log('Customer emails:', customers.items.map((c: any) => c.email));
            
            // Use case-insensitive email comparison since Razorpay normalizes emails to lowercase
            const existingCustomer = customers.items.find((c: any) => 
              c.email && c.email.toLowerCase() === email.toLowerCase()
            );
            if (existingCustomer) {
              console.log('Found existing customer:', existingCustomer);
              return existingCustomer;
            } else {
              console.log('No customer found with email:', email);
            }
          } else {
            console.log('No customers.items found in response');
          }
        } catch (fetchError: any) {
          console.error('Failed to fetch existing customer:', fetchError);
        }
      }
      
      throw new Error(error.message || 'Failed to create customer');
    }
  }

  static async createSubscription(planKey: string, customerId?: string) {
    try {
      const planIdMap: Record<string, string> = {
        basic: process.env.RAZORPAY_PLAN_BASIC || '',
        pro: process.env.RAZORPAY_PLAN_PRO || '',
        advanced: process.env.RAZORPAY_PLAN_ADVANCED || '',
      };

      const planId = planIdMap[planKey];
      if (!planId) {
        throw new Error(`Invalid plan: ${planKey}`);
      }

      const subscription = await razorpay.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        total_count: 12,
        ...(customerId && { customer_id: customerId }),
      });

      return subscription;
    } catch (error: any) {
      console.error('Razorpay subscription creation failed:', error);
      throw new Error(error.error?.description || error.message || 'Failed to create subscription');
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planKey, organizationId } = await req.json();

    if (!planKey || !organizationId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if subscription already exists
    const existingSubscription = await SubscriptionService.getSubscriptionByOrgId(organizationId);
    
    let customerId = existingSubscription?.razorpay_customer_id;

    // Create Razorpay customer if doesn't exist
    if (!customerId) {
      const customer = await RazorpayService.createCustomer(
        `org_${organizationId}@futuristichr.com`, // You might want to use actual email
        organizationId,
        organizationId
      );
      customerId = customer.id;
    }

    // Create Razorpay subscription
    const subscription = await RazorpayService.createSubscription(planKey, customerId);

    // Store subscription in database (pending status until payment verification)
    if (existingSubscription) {
      await SubscriptionService.updateSubscription(organizationId, {
        plan_type: planKey as any,
        status: 'pending', // Changed from 'active' to 'pending'
        razorpay_subscription_id: subscription.id,
        razorpay_customer_id: customerId,
      });
    } else {
      await SubscriptionService.createSubscription({
        organization_id: organizationId,
        plan_type: planKey as any,
        status: 'pending', // Changed from 'active' to 'pending'
        razorpay_subscription_id: subscription.id,
        razorpay_customer_id: customerId,
      });
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      customerId,
    });
  } catch (error: any) {
    console.error('Create subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
