import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { JobBoardIntegrationService } from "@/services/job-board-integration.service";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get("job_id");

    if (!jobId) {
      return NextResponse.json({ error: "job_id is required" }, { status: 400 });
    }

    const postings = await JobBoardIntegrationService.getJobExternalPostings(jobId);

    return NextResponse.json({ postings });
  } catch (error: any) {
    console.error("Error fetching job board postings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch postings" },
      { status: 500 }
    );
  }
}

