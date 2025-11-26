import { NextRequest, NextResponse } from "next/server";
import { CandidateStatusService } from "@/services/candidate-status.service";
import { logger } from "@/lib/logger";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { responseId, newStatus, reason, requestedBy } = body;

    if (!responseId || !newStatus) {
      return NextResponse.json(
        { error: "Response ID and new status are required" },
        { status: 400 }
      );
    }

    const result = await CandidateStatusService.updateCandidateStatus(
      responseId,
      newStatus,
      reason,
      requestedBy
    );

    logger.info(`Updated candidate status for response ${responseId} to ${newStatus}`);

    return NextResponse.json(
      { result, message: "Status updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error updating candidate status", error as Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const responseId = searchParams.get("responseId");
    const type = searchParams.get("type"); // 'history' or 'pending' or 'metrics'
    const interviewId = searchParams.get("interviewId");

    let result;

    switch (type) {
      case 'history':
        if (!responseId) {
          return NextResponse.json(
            { error: "Response ID is required for status history" },
            { status: 400 }
          );
        }
        result = await CandidateStatusService.getStatusHistory(parseInt(responseId));
        break;
      case 'pending':
        result = await CandidateStatusService.getPendingStatusChanges();
        break;
      case 'metrics':
        result = await CandidateStatusService.getStatusMetrics(interviewId || undefined);
        break;
      case 'recommendation':
        if (!responseId) {
          return NextResponse.json(
            { error: "Response ID is required for status recommendation" },
            { status: 400 }
          );
        }
        result = await CandidateStatusService.getRecommendedStatus(parseInt(responseId));
        break;
      default:
        return NextResponse.json(
          { error: "Invalid type parameter" },
          { status: 400 }
        );
    }

    logger.info(`Fetched candidate status data: ${type}`);

    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    logger.error("Error fetching candidate status data", error as Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
