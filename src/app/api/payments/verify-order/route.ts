import { NextRequest, NextResponse } from "next/server";
import { RazorpayService } from "@/services/razorpay.service";
import { TrialsService } from "@/services/trials.service";
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

    // Verify payment signature
    const isValid = RazorpayService.verifyOrderSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Update Trial Status to 'in_progress' to simulate activated work
    // In a real escrow, we might change it to 'escrow_funded'
    await TrialsService.updateTrial(trialId, {
      status: 'in_progress'
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
