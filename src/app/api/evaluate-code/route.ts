import { NextRequest, NextResponse } from "next/server";
import { CodeEvaluationService } from "@/services/skill-assessment.service";
import { logger } from "@/lib/logger";

export const maxDuration = 120; // Increase timeout for code evaluation

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, language, challenge, submissionData } = body;

    if (!code || !language || !challenge) {
      return NextResponse.json(
        { error: "Code, language, and challenge are required" },
        { status: 400 }
      );
    }

    const evaluation = await CodeEvaluationService.evaluateCodeSubmission(
      code,
      language,
      challenge,
      submissionData || {}
    );

    logger.info(`Evaluated code submission for challenge: ${challenge.id}`);

    return NextResponse.json(
      { evaluation, message: "Code evaluated successfully" },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error evaluating code submission", error as Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
