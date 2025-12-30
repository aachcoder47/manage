import { NextRequest, NextResponse } from "next/server";
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

    const { trialId, amount } = await req.json();

    if (!trialId || !amount) {
      return NextResponse.json({ error: "Missing trialId or amount" }, { status: 400 });
    }

    const receipt = `trial_${trialId}_${Date.now()}`;
    const order = await RazorpayService.createOrder(amount, "INR", receipt);

    // Store payment transaction record
    await supabase.from("payment_transaction").insert({
      sender_id: user.id,
      entity_type: "work_trial",
      entity_id: trialId,
      amount,
      currency: "INR",
      type: "trial_fee",
      status: "pending",
      razorpay_order_id: order.id,
    });

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Work trial payment creation error:", error);
    return NextResponse.json(
      { error: error.message || "Payment creation failed" },
      { status: 500 }
    );
  }
}
