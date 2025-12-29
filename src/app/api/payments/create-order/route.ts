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

    const { amount, receipt } = await req.json();

    const order = await RazorpayService.createOrder(amount, "USD", receipt);

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      { error: error.message || "Payment creation failed" },
      { status: 500 }
    );
  }
}
