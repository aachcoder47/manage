import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuth } from "@clerk/nextjs/server";
import { EmailService } from "@/services/email.service";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, context: { params: { interviewId: string } }) {
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

    const interviewId = context.params.interviewId;
    const updates = await req.json();

    const { data: actor, error: actorErr } = await supabase
      .from("user")
      .select("id, organization_id, email")
      .eq("id", userId)
      .single();

    if (actorErr || !actor) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: existing, error: existingErr } = await supabase
      .from("interview")
      .select("id, organization_id, user_id, name")
      .or(`id.eq.${interviewId},readable_slug.eq.${interviewId}`)
      .single();

    if (existingErr || !existing) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    if (existing.organization_id !== actor.organization_id && existing.user_id !== actor.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: updated, error: updateErr } = await supabase
      .from("interview")
      .update({ ...updates })
      .eq("id", existing.id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    const { data: orgRow } = await supabase
      .from("organization")
      .select("name")
      .eq("id", existing.organization_id)
      .single();

    try {
      if (actor.email) {
        await EmailService.trackInterviewUpdated({
          interviewId: existing.id,
          organizationId: existing.organization_id,
          organizationName: orgRow?.name,
          employerEmail: actor.email,
          changes: updates,
        });
      }
    } catch (e) {
      console.warn("MailerLite interview-updated trigger failed:", e);
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating interview:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: { interviewId: string } }) {
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

    const interviewId = context.params.interviewId;

    const { data: actor, error: actorErr } = await supabase
      .from("user")
      .select("id, organization_id, email")
      .eq("id", userId)
      .single();

    if (actorErr || !actor) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: existing, error: existingErr } = await supabase
      .from("interview")
      .select("id, organization_id, user_id")
      .eq("id", interviewId)
      .single();

    if (existingErr || !existing) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    if (existing.organization_id !== actor.organization_id && existing.user_id !== actor.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error: delErr } = await supabase.from("interview").delete().eq("id", interviewId);
    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }

    const { data: orgRow } = await supabase
      .from("organization")
      .select("name")
      .eq("id", existing.organization_id)
      .single();

    try {
      if (actor.email) {
        await EmailService.trackInterviewDeleted({
          interviewId: existing.id,
          organizationId: existing.organization_id,
          organizationName: orgRow?.name,
          employerEmail: actor.email,
        });
      }
    } catch (e) {
      console.warn("MailerLite interview-deleted trigger failed:", e);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting interview:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
