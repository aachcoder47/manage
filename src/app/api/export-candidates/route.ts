import { NextRequest, NextResponse } from "next/server";
import { CandidateFilteringService } from "@/services/candidate-filtering.service";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { interviewId, format = 'csv', criteria } = body;

    if (!interviewId) {
      return NextResponse.json(
        { error: "Interview ID is required" },
        { status: 400 }
      );
    }

    const exportData = await CandidateFilteringService.exportCandidatesData(
      interviewId,
      format,
      criteria
    );

    logger.info(`Exported candidates data for interview ${interviewId} in ${format} format`);

    // Set appropriate headers for file download
    const headers = new Headers();
    headers.set('Content-Type', format === 'json' ? 'application/json' : 'text/csv');
    headers.set('Content-Disposition', `attachment; filename="candidates_${interviewId}.${format}"`);

    return new NextResponse(exportData, {
      status: 200,
      headers
    });
  } catch (error) {
    logger.error("Error exporting candidates data", error as Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
