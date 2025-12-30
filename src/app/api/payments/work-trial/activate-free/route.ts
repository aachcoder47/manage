import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      const missing = [];
      if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL');
      if (!supabaseKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
      return NextResponse.json({ error: `Server configuration error: missing ${missing.join(', ')}` }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { trialId } = await req.json();

    if (!trialId) {
      return NextResponse.json({ error: "Missing trialId" }, { status: 400 });
    }

    // Mark work trial as active (paid) without payment
    const { error: trialErr } = await supabase
      .from("work_trial")
      .update({ status: "active", payment_status: "paid" })
      .eq("id", trialId)
      .eq("candidate_id", userId);

    if (trialErr) {
      return NextResponse.json({ error: trialErr.message }, { status: 500 });
    }

    // Optionally, insert a zero-amount payment transaction for audit
    const { error: txErr } = await supabase.from("payment_transaction").insert({
      sender_id: userId,
      entity_type: "work_trial",
      entity_id: trialId,
      amount: 0,
      currency: "INR",
      type: "trial_fee",
      status: "completed",
    });

    if (txErr) {
      // Non-critical: log but don't fail
      console.error("Failed to insert zero-amount transaction:", txErr);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Free trial activation error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
