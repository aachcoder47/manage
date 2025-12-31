import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuth } from "@clerk/nextjs/server";
import { emailTriggerService } from "@/services/email-trigger.service";

export const dynamic = "force-dynamic";

function ensureProtocol(url: string): string {
  if (!url) {return url;}
  if (url.startsWith("http://") || url.startsWith("https://")) {return url;}
  return `https://${url}`;
}

export async function PATCH(req: NextRequest, context: { params: { appId: string } }) {
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

    const { status } = await req.json();
    if (!status) {
      return NextResponse.json({ error: "status is required" }, { status: 400 });
    }

    const appId = context.params.appId;

    const { data: actor, error: actorErr } = await supabase
      .from("user")
      .select("id, organization_id")
      .eq("id", userId)
      .single();

    if (actorErr || !actor) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: existingApp, error: appErr } = await supabase
      .from("job_application")
      .select("id, job_id, candidate_id, email, phone, status")
      .eq("id", appId)
      .single();

    if (appErr || !existingApp) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const { data: job, error: jobErr } = await supabase
      .from("job")
      .select("id, title, organization_id")
      .eq("id", existingApp.job_id)
      .single();

    if (jobErr || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.organization_id !== actor.organization_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: updated, error: updateErr } = await supabase
      .from("job_application")
      .update({ status })
      .eq("id", appId)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    let candidateEmail: string | undefined = existingApp.email;
    let candidatePhone: string | undefined = existingApp.phone;

    if (!candidateEmail && existingApp.candidate_id) {
      const { data: candidateUser } = await supabase
        .from("user")
        .select("email")
        .eq("id", existingApp.candidate_id)
        .single();
      candidateEmail = candidateUser?.email;
    }

    let interviewUrl: string | undefined;
    if (status === "interviewing") {
      const { data: interview } = await supabase
        .from("interview")
        .select("id, readable_slug")
        .eq("job_id", existingApp.job_id)
        .limit(1)
        .maybeSingle();

      if (interview?.id) {
        const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_LIVE_URL || "";
        const base = ensureProtocol(origin);
        const slug = interview.readable_slug || interview.id;
        if (base) {interviewUrl = `${base}/call/${slug}`;}
      }
    }

    // Send interview invite email if status is "interviewing"
    if (status === "interviewing" && interviewUrl && candidateEmail) {
      try {
        await emailTriggerService.sendInterviewInviteEmail({
          candidateName: existingApp.email || 'Candidate',
          positionTitle: job.title,
          organizationName: 'Your Company',
          interviewDate: new Date().toLocaleDateString(),
          interviewTime: new Date().toLocaleTimeString(),
          interviewLink: interviewUrl,
          recipientEmail: candidateEmail,
          userId: actor.id,
          organizationId: actor.organization_id
        });
        console.log('Interview invite email sent to:', candidateEmail);
      } catch (emailError) {
        console.error('Failed to send interview invite email:', emailError);
      }
    }

    // MailerLite integration removed

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating application status:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
