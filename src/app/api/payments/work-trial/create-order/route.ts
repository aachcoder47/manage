import { NextRequest, NextResponse } from "next/server";
import { RazorpayService } from "@/services/razorpay.service";
import { createClient } from "@supabase/supabase-js";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { trialId, amount } = await req.json();

    if (!trialId || !amount) {
      return NextResponse.json({ error: "Missing trialId or amount" }, { status: 400 });
    }

    const receipt = `trial_${trialId}_${Date.now()}`;
    const order = await RazorpayService.createOrder(amount, "INR", receipt);

    const insertAttempt = await supabase.from("payment_transaction").insert({
      sender_id: userId,
      entity_type: "work_trial",
      entity_id: trialId,
      amount,
      currency: "INR",
      type: "trial_fee",
      status: "pending",
      razorpay_order_id: order.id,
    });

    if (insertAttempt.error && insertAttempt.error.message.includes("razorpay_order_id")) {
      const retry = await supabase.from("payment_transaction").insert({
        sender_id: userId,
        entity_type: "work_trial",
        entity_id: trialId,
        amount,
        currency: "INR",
        type: "trial_fee",
        status: "pending",
      });
      if (retry.error) {
        return NextResponse.json({ error: retry.error.message }, { status: 500 });
      }
    } else if (insertAttempt.error) {
      return NextResponse.json({ error: insertAttempt.error.message }, { status: 500 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Work trial payment creation error:", error);
    return NextResponse.json(
      { error: error?.message || "Payment creation failed" },
      { status: 500 }
    );
  }
}
