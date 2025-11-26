import { NextRequest, NextResponse } from "next/server";
import { SkillAssessmentService } from "@/services/skill-assessment.service";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const skillAssessmentId = searchParams.get("skillAssessmentId");

    if (!skillAssessmentId) {
      return NextResponse.json(
        { error: "Skill assessment ID is required" },
        { status: 400 }
      );
    }

    const challenges = await SkillAssessmentService.getCodingChallengesByAssessment(skillAssessmentId);

    logger.info(`Fetched ${challenges.length} coding challenges for assessment ${skillAssessmentId}`);

    return NextResponse.json({ challenges }, { status: 200 });
  } catch (error) {
    logger.error("Error fetching coding challenges", error as Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const challenge = await SkillAssessmentService.createCodingChallenge(body);

    logger.info(`Created coding challenge: ${challenge.id}`);

    return NextResponse.json(
      { challenge, message: "Coding challenge created successfully" },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Error creating coding challenge", error as Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
