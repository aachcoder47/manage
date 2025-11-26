import { NextRequest, NextResponse } from "next/server";
import { SkillAssessmentService } from "@/services/skill-assessment.service";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const interviewId = searchParams.get("interviewId");

    if (!interviewId) {
      return NextResponse.json(
        { error: "Interview ID is required" },
        { status: 400 }
      );
    }

    const assessments = await SkillAssessmentService.getSkillAssessmentsByInterview(interviewId);

    logger.info(`Fetched ${assessments.length} skill assessments for interview ${interviewId}`);

    return NextResponse.json({ assessments }, { status: 200 });
  } catch (error) {
    logger.error("Error fetching skill assessments", error as Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const assessment = await SkillAssessmentService.createSkillAssessment(body);

    logger.info(`Created skill assessment: ${assessment.id}`);

    return NextResponse.json(
      { assessment, message: "Skill assessment created successfully" },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Error creating skill assessment", error as Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const body = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Assessment ID is required" },
        { status: 400 }
      );
    }

    const assessment = await SkillAssessmentService.updateSkillAssessment(id, body);

    logger.info(`Updated skill assessment: ${id}`);

    return NextResponse.json(
      { assessment, message: "Skill assessment updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error updating skill assessment", error as Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Assessment ID is required" },
        { status: 400 }
      );
    }

    await SkillAssessmentService.deleteSkillAssessment(id);

    logger.info(`Deleted skill assessment: ${id}`);

    return NextResponse.json(
      { message: "Skill assessment deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error deleting skill assessment", error as Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
