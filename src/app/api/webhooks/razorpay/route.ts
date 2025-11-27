import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/services/subscription.service';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);

    // Handle different webhook events
    switch (event.event) {
      case 'subscription.charged':
        // Payment successful
        await handleSubscriptionCharged(event.payload.subscription.entity);
        break;

      case 'subscription.cancelled':
        // Subscription cancelled
        await handleSubscriptionCancelled(event.payload.subscription.entity);
        break;

      case 'subscription.completed':
        // Subscription completed (all payments done)
        await handleSubscriptionCompleted(event.payload.subscription.entity);
        break;

      case 'subscription.paused':
      case 'subscription.halted':
        // Subscription paused or halted
        await handleSubscriptionPaused(event.payload.subscription.entity);
        break;

      default:
        console.log('Unhandled webhook event:', event.event);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCharged(subscription: any) {
  // Find subscription by Razorpay ID
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { data } = await supabase
    .from('subscription')
    .select('organization_id')
    .eq('razorpay_subscription_id', subscription.id)
    .single();

  if (data) {
    await SubscriptionService.updateSubscription(data.organization_id, {
      status: 'active',
      current_period_start: new Date(subscription.current_start * 1000),
      current_period_end: new Date(subscription.current_end * 1000),
    });
  }
}

async function handleSubscriptionCancelled(subscription: any) {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { data } = await supabase
    .from('subscription')
    .select('organization_id')
    .eq('razorpay_subscription_id', subscription.id)
    .single();

  if (data) {
    await SubscriptionService.updateSubscription(data.organization_id, {
      status: 'cancelled',
    });
  }
}

async function handleSubscriptionCompleted(subscription: any) {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { data } = await supabase
    .from('subscription')
    .select('organization_id')
    .eq('razorpay_subscription_id', subscription.id)
    .single();

  if (data) {
    await SubscriptionService.updateSubscription(data.organization_id, {
      status: 'expired',
    });
  }
}

async function handleSubscriptionPaused(subscription: any) {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { data } = await supabase
    .from('subscription')
    .select('organization_id')
    .eq('razorpay_subscription_id', subscription.id)
    .single();

  if (data) {
    await SubscriptionService.updateSubscription(data.organization_id, {
      status: 'cancelled',
    });
  }
}
