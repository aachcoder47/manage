import { NextRequest, NextResponse } from "next/server";
import { CandidateFilteringService } from "@/services/candidate-filtering.service";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { interviewId, criteria, page = 1, limit = 20 } = body;

    if (!interviewId) {
      return NextResponse.json(
        { error: "Interview ID is required" },
        { status: 400 }
      );
    }

    const result = await CandidateFilteringService.filterCandidates(
      interviewId,
      criteria || {},
      page,
      limit
    );

    logger.info(`Filtered candidates for interview ${interviewId}: ${result.total_count} total`);

    return NextResponse.json(
      { result, message: "Candidates filtered successfully" },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error filtering candidates", error as Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
