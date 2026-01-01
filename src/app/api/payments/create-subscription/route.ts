import { NextRequest, NextResponse } from 'next/server';
import { RazorpayService } from '@/services/razorpay.service';
import { SubscriptionService } from '@/services/subscription.service';
import { getAuth } from '@clerk/nextjs/server';

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
