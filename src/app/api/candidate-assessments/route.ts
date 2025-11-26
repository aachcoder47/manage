import { NextRequest, NextResponse } from "next/server";
import { SkillAssessmentService } from "@/services/skill-assessment.service";
import { CodeEvaluationService } from "@/services/skill-assessment.service";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const responseId = searchParams.get("responseId");

    if (!responseId) {
      return NextResponse.json(
        { error: "Response ID is required" },
        { status: 400 }
      );
    }

    const assessments = await SkillAssessmentService.getCandidateAssessmentsByResponse(parseInt(responseId));

    logger.info(`Fetched ${assessments.length} candidate assessments for response ${responseId}`);

    return NextResponse.json({ assessments }, { status: 200 });
  } catch (error) {
    logger.error("Error fetching candidate assessments", error as Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { responseId, skillAssessmentId, submissionData, evaluateSubmission = false } = body;

    if (!responseId || !skillAssessmentId) {
      return NextResponse.json(
        { error: "Response ID and skill assessment ID are required" },
        { status: 400 }
      );
    }

    // Create the candidate assessment record
    const assessment = await SkillAssessmentService.createCandidateAssessment({
      response_id: parseInt(responseId),
      skill_assessment_id: skillAssessmentId,
      started_at: new Date(),
      submission_data: submissionData || {},
      time_spent: 0
    });

    // If evaluation is requested and code submission is provided
    if (evaluateSubmission && submissionData?.code) {
      // This would need to fetch the coding challenge details
      // For now, just return the created assessment
      logger.info(`Created candidate assessment: ${assessment.id} (evaluation requested)`);
    } else {
      logger.info(`Created candidate assessment: ${assessment.id}`);
    }

    return NextResponse.json(
      { assessment, message: "Candidate assessment created successfully" },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Error creating candidate assessment", error as Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { assessmentId, score, maxScore, passed, evaluationDetails, timeSpent } = body;

    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment ID is required" },
        { status: 400 }
      );
    }

    const assessment = await SkillAssessmentService.updateCandidateAssessment(assessmentId, {
      score,
      max_score: maxScore,
      passed,
      evaluation_details: evaluationDetails,
      time_spent: timeSpent,
      completed_at: new Date()
    });

    logger.info(`Updated candidate assessment: ${assessmentId}`);

    return NextResponse.json(
      { assessment, message: "Candidate assessment updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error updating candidate assessment", error as Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
