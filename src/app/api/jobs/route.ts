import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuth } from "@clerk/nextjs/server";
import { EmailService } from "@/services/email.service";

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
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload = await req.json();
    const organizationId = payload?.organization_id;

    if (!organizationId) {
      return NextResponse.json({ error: "organization_id is required" }, { status: 400 });
    }

    const { data: userRow, error: userErr } = await supabase
      .from("user")
      .select("id, organization_id, email")
      .eq("id", userId)
      .single();

    if (userErr || !userRow) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (userRow.organization_id !== organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: job, error: jobErr } = await supabase
      .from("job")
      .insert(payload)
      .select()
      .single();

    if (jobErr) {
      return NextResponse.json({ error: jobErr.message }, { status: 500 });
    }

    const { data: org } = await supabase
      .from("organization")
      .select("name")
      .eq("id", organizationId)
      .single();

    try {
      await EmailService.trackJobPosted({
        employerEmail: userRow.email || "",
        organizationId,
        organizationName: org?.name,
        jobId: job.id,
        jobTitle: job.title,
      });
    } catch (e) {
      console.warn("MailerLite job-posted trigger failed:", e);
    }

    return NextResponse.json(job);
  } catch (error: any) {
    console.error("Error creating job:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
