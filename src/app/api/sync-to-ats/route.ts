import { NextRequest, NextResponse } from "next/server";
import { ATSIntegrationService } from "@/services/ats.service";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { integrationId, candidateProfile, responseId, type } = body;

    if (!integrationId || !responseId) {
      return NextResponse.json(
        { error: "Integration ID and response ID are required" },
        { status: 400 }
      );
    }

    let result;
    switch (type) {
      case 'candidate_create':
        result = await ATSIntegrationService.syncCandidateToATS(
          integrationId,
          candidateProfile,
          responseId
        );
        break;
      case 'status_update':
        result = await ATSIntegrationService.updateCandidateStatusInATS(
          integrationId,
          candidateProfile.providerCandidateId,
          candidateProfile.status,
          responseId
        );
        break;
      case 'assessment_result':
        result = await ATSIntegrationService.syncAssessmentResultsToATS(
          integrationId,
          candidateProfile.providerCandidateId,
          candidateProfile.assessmentData,
          responseId
        );
        break;
      default:
        return NextResponse.json(
          { error: "Invalid sync type" },
          { status: 400 }
        );
    }

    logger.info(`Synced to ATS: ${type} for response ${responseId}`);

    return NextResponse.json(
      { result, message: "Sync completed successfully" },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error syncing to ATS", error as Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
