import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import { InterviewService } from "@/services/interviews.service";
import { logger } from "@/lib/logger";

const base_url = process.env.NEXT_PUBLIC_LIVE_URL;

export async function POST(req: Request, res: Response) {
  let body: any = null;
  try {
    const url_id = nanoid();
    const url = `${base_url}/call/${url_id}`;
    body = await req.json() as {
      organizationName?: string;
      interviewData: any;
    };

    logger.info("create-interview request received");
    logger.info("Request body:", JSON.stringify(body, null, 2));

    const payload = body.interviewData;

    let readableSlug = null;
    if (body.organizationName) {
      const interviewNameSlug = payload.name?.toLowerCase().replace(/\s/g, "-");
      const orgNameSlug = body.organizationName
        ?.toLowerCase()
        .replace(/\s/g, "-");
      readableSlug = `${orgNameSlug}-${interviewNameSlug}`;
    }

    logger.info("Creating interview with payload:", JSON.stringify(payload, null, 2));

    const newInterview = await InterviewService.createInterview({
      ...payload,
      url: url,
      id: url_id,
      readable_slug: readableSlug,
    });

    // MailerLite integration removed

    logger.info("Interview created successfully");

    return NextResponse.json(
      { response: "Interview created successfully" },
      { status: 200 },
    );
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error("Error creating interview:", error);
    logger.error("Error details:", {
      message: error.message,
      stack: error.stack,
      body: body,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      { 
        error: (err as Error).message || "Internal server error",
        details: "Failed to create interview",
        timestamp: new Date().toISOString()
      },
      { status: 500 },
    );
  }
}
