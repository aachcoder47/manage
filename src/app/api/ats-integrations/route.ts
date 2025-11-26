import { NextRequest, NextResponse } from "next/server";
import { ATSIntegrationService } from "@/services/ats.service";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const integrations = await ATSIntegrationService.getATSIntegrationsByOrganization(organizationId);

    logger.info(`Fetched ${integrations.length} ATS integrations for organization ${organizationId}`);

    return NextResponse.json({ integrations }, { status: 200 });
  } catch (error) {
    logger.error("Error fetching ATS integrations", error as Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const integration = await ATSIntegrationService.createATSIntegration(body);

    logger.info(`Created ATS integration: ${integration.id}`);

    return NextResponse.json(
      { integration, message: "ATS integration created successfully" },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Error creating ATS integration", error as Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
