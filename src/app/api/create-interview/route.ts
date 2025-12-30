import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import { InterviewService } from "@/services/interviews.service";
import { logger } from "@/lib/logger";
import { createClient } from "@supabase/supabase-js";
import { EmailService } from "@/services/email.service";

const base_url = process.env.NEXT_PUBLIC_LIVE_URL;

export async function POST(req: Request, res: Response) {
  try {
    const url_id = nanoid();
    const url = `${base_url}/call/${url_id}`;
    const body = await req.json();

    logger.info("create-interview request received");

    const payload = body.interviewData;

    let readableSlug = null;
    if (body.organizationName) {
      const interviewNameSlug = payload.name?.toLowerCase().replace(/\s/g, "-");
      const orgNameSlug = body.organizationName
        ?.toLowerCase()
        .replace(/\s/g, "-");
      readableSlug = `${orgNameSlug}-${interviewNameSlug}`;
    }

    const newInterview = await InterviewService.createInterview({
      ...payload,
      url: url,
      id: url_id,
      readable_slug: readableSlug,
    });

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data: userRow } = await supabase
          .from("user")
          .select("email")
          .eq("id", payload.user_id)
          .single();

        const { data: orgRow } = await supabase
          .from("organization")
          .select("name")
          .eq("id", payload.organization_id)
          .single();

        if (userRow?.email) {
          await EmailService.trackInterviewCreated({
            interviewId: url_id,
            interviewName: payload.name,
            organizationId: payload.organization_id,
            organizationName: orgRow?.name,
            employerEmail: userRow.email,
          });
        }
      }
    } catch (e) {
      console.warn("MailerLite interview-created trigger failed:", e);
    }

    logger.info("Interview created successfully");

    return NextResponse.json(
      { response: "Interview created successfully" },
      { status: 200 },
    );
  } catch (err) {
    logger.error("Error creating interview");

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
