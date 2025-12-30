import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

function isAdminUserId(userId: string | null | undefined) {
  if (!userId) return false;
  const raw = process.env.ADMIN_USER_IDS || "";
  const ids = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return ids.includes(userId);
}

export async function DELETE(req: NextRequest, context: { params: { jobId: string } }) {
  try {
    const { userId } = getAuth(req);
    if (!isAdminUserId(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const jobId = context.params.jobId;

    const { data: applications, error: appsErr } = await supabase
      .from("job_application")
      .select("id")
      .eq("job_id", jobId);

    if (appsErr) {
      return NextResponse.json({ error: appsErr.message }, { status: 500 });
    }

    const applicationIds = (applications || []).map((a: any) => a.id).filter(Boolean);

    if (applicationIds.length > 0) {
      const { data: trials } = await supabase
        .from("work_trial")
        .select("id")
        .in("job_application_id", applicationIds);

      const trialIds = (trials || []).map((t: any) => t.id).filter(Boolean);

      if (trialIds.length > 0) {
        await supabase.from("payment_transaction").delete().in("entity_id", trialIds);
      }

      await supabase.from("work_trial").delete().in("job_application_id", applicationIds);
      await supabase.from("contract").delete().in("job_application_id", applicationIds);
    }

    await supabase.from("job_application").delete().eq("job_id", jobId);

    await supabase.from("interview").update({ job_id: null }).eq("job_id", jobId);

    const { error: jobErr } = await supabase.from("job").delete().eq("id", jobId);
    if (jobErr) {
      return NextResponse.json({ error: jobErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin delete job error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
