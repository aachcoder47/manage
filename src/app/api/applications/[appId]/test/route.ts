import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ appId: string }> }
) {
  try {
    const params = await context.params;
    return NextResponse.json({
      success: true,
      message: "Test endpoint working",
      appId: params.appId,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ appId: string }> }
) {
  try {
    const params = await context.params;
    return NextResponse.json({
      success: true,
      message: "POST test endpoint working",
      appId: params.appId,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
