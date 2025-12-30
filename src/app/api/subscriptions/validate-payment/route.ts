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

    // Validate and process payment
    const result = await SubscriptionService.validateAndProcessPayment(orgData.organization_id);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Payment validation error:", error);
    return NextResponse.json(
      { error: error.message || "Payment validation failed" },
      { status: 500 }
    );
  }
}

// This endpoint would be called by a cron job to validate all payments
export async function GET(req: NextRequest) {
  try {
    // This should be secured with a cron secret
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all organizations with active subscriptions
    const supabase = createRouteHandlerClient({ cookies });
    const { data: subscriptions, error } = await supabase
      .from('subscription')
      .select('organization_id')
      .in('status', ['active']);

    if (error || !subscriptions) {
      return NextResponse.json({ 
        error: "Failed to fetch subscriptions" 
      }, { status: 500 });
    }

    const results = [];
    for (const sub of subscriptions) {
      const result = await SubscriptionService.validateAndProcessPayment(sub.organization_id);
      results.push({
        organization_id: sub.organization_id,
        ...result
      });
    }

    return NextResponse.json({ 
      success: true, 
      results 
    });

  } catch (error: any) {
    console.error("Batch payment validation error:", error);
    return NextResponse.json(
      { error: error.message || "Batch validation failed" },
      { status: 500 }
    );
  }
}
