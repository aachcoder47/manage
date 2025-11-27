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

    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
      organizationId,
      planKey,
    } = await req.json();

    // Verify payment signature
    const isValid = RazorpayService.verifyPaymentSignature(
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Get subscription details from Razorpay
    const subscription = await RazorpayService.getSubscription(razorpay_subscription_id);

    // Update subscription in database
    await SubscriptionService.updateSubscription(organizationId, {
      status: 'active',
      current_period_start: new Date(subscription.start_at * 1000),
      current_period_end: subscription.current_end 
        ? new Date(subscription.current_end * 1000)
        : new Date(subscription.start_at * 1000 + 30 * 24 * 60 * 60 * 1000), // Default to 30 days
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
