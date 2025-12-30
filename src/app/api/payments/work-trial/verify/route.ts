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

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      trialId 
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    // Verify payment signature
    const isValidSignature = RazorpayService.verifyOrderSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Update payment transaction record
    await supabase
      .from("payment_transaction")
      .update({
        status: "released",
        razorpay_payment_id,
        razorpay_signature,
      })
      .eq("razorpay_order_id", razorpay_order_id);

    // Update work trial status to in_progress if payment is successful
    if (trialId) {
      await supabase
        .from("work_trial")
        .update({ status: "in_progress" })
        .eq("id", trialId);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Payment verified successfully" 
    });
  } catch (error: any) {
    console.error("Work trial payment verification error:", error);
    return NextResponse.json(
      { error: error.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
