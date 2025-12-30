import { NextRequest, NextResponse } from "next/server";
import { SubscriptionService } from "@/services/subscription.service";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planType, userEmail, userName } = await req.json();

    if (!planType || !userEmail || !userName) {
      return NextResponse.json({ 
        error: "Missing required fields: planType, userEmail, userName" 
      }, { status: 400 });
    }

    if (!['basic', 'pro', 'advanced'].includes(planType)) {
      return NextResponse.json({ 
        error: "Invalid plan type. Must be basic, pro, or advanced" 
      }, { status: 400 });
    }

    // Get user's organization
    const { data: orgData, error: orgError } = await supabase
      .from("user")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    if (orgError || !orgData?.organization_id) {
      return NextResponse.json({ 
        error: "User organization not found" 
      }, { status: 404 });
    }

    // Check if user already has an active trial or subscription
    const existingSubscription = await SubscriptionService.getSubscriptionByOrgId(orgData.organization_id);
    if (existingSubscription && existingSubscription.status !== 'cancelled') {
      return NextResponse.json({ 
        error: "User already has an active subscription or trial" 
      }, { status: 400 });
    }

    // Create trial subscription
    const trial = await SubscriptionService.createTrialSubscription(
      orgData.organization_id,
      planType as 'basic' | 'pro' | 'advanced',
      userEmail,
      userName
    );

    return NextResponse.json({ 
      success: true, 
      trial: {
        id: trial.id,
        plan_type: trial.plan_type,
        trial_end: trial.trial_end,
        status: trial.status
      }
    });

  } catch (error: any) {
    console.error("Trial creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create trial" },
      { status: 500 }
    );
  }
}
