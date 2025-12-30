import { NextRequest, NextResponse } from "next/server";
import { SubscriptionService } from "@/services/subscription.service";
import { RazorpayService } from "@/services/razorpay.service";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { 
      razorpayPaymentId, 
      razorpayOrderId, 
      razorpaySignature,
      planType 
    } = await req.json();

    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature || !planType) {
      return NextResponse.json({ 
        error: "Missing required payment details" 
      }, { status: 400 });
    }

    // Get user's organization
    const { data: orgData, error: orgError } = await supabase
      .from("user")
      .select("organization_id, email, full_name")
      .eq("id", user.id)
      .single();

    if (orgError || !orgData?.organization_id) {
      return NextResponse.json({ 
        error: "User organization not found" 
      }, { status: 404 });
    }

    // Verify Razorpay payment signature
    const isValidSignature = RazorpayService.verifyOrderSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValidSignature) {
      return NextResponse.json({ 
        error: "Invalid payment signature" 
      }, { status: 400 });
    }

    // Get current trial subscription
    const trial = await SubscriptionService.getSubscriptionByOrgId(orgData.organization_id);
    if (!trial || trial.status !== 'trial') {
      return NextResponse.json({ 
        error: "No active trial found" 
      }, { status: 400 });
    }

    // Create Razorpay customer and subscription
    const customer = await RazorpayService.createCustomer(
      orgData.email,
      orgData.full_name || 'User',
      orgData.organization_id
    );

    // Map plan types to Razorpay plan IDs (you'll need to create these in Razorpay dashboard)
    const planIdMap: Record<string, string> = {
      basic: process.env.RAZORPAY_PLAN_BASIC || '',
      pro: process.env.RAZORPAY_PLAN_PRO || '',
      advanced: process.env.RAZORPAY_PLAN_ADVANCED || '',
    };

    const planId = planIdMap[planType];
    if (!planId) {
      return NextResponse.json({ 
        error: `Plan ID not configured for ${planType}` 
      }, { status: 400 });
    }

    const subscription = await RazorpayService.createSubscription(planType, customer.id);

    // Convert trial to paid subscription
    const updatedSubscription = await SubscriptionService.convertTrialToPaid(
      orgData.organization_id,
      subscription.id,
      customer.id,
      '****', // You'd extract this from the payment method
      'card', // You'd extract this from the payment method
      orgData.email,
      orgData.full_name || 'User'
    );

    return NextResponse.json({ 
      success: true, 
      subscription: updatedSubscription 
    });

  } catch (error: any) {
    console.error("Trial conversion error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to convert trial" },
      { status: 500 }
    );
  }
}
