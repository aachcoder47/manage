import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: { applicationId: string } }) {
  const { applicationId } = params;

  // TODO: implement real retrieval logic (e.g., fetch from database or storage)
  // This placeholder returns a 200 so requests to /api/applications/:id/screen do not 404.
  return NextResponse.json(
    {
      applicationId,
      screenUrl: null,
      message:
        "Placeholder endpoint created. Implement storage lookup and return the screen URL or binary content.",
    },
    { status: 200 },
  );
}
