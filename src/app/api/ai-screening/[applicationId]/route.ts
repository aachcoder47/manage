// src/app/api/ai-screening/[applicationId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AIScreeningService } from '@/services/ai-screening.service';

export async function POST(
  request: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  try {
    const applicationId = params.applicationId;

    // Check if screening already exists
    const existingScreening = await AIScreeningService.getScreeningByApplicationId(applicationId);
    
    if (existingScreening) {
      return NextResponse.json({
        screening: existingScreening,
        message: 'Screening already exists for this application'
      });
    }

    // Create new screening
    const screening = await AIScreeningService.createScreening(applicationId);

    // Start processing in background
    AIScreeningService.processScreening(screening.id).catch(error => {
      console.error('Background screening processing failed:', error);
    });

    return NextResponse.json({
      screening,
      message: 'AI screening started'
    });
  } catch (error: any) {
    console.error('Failed to start AI screening:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start AI screening' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  try {
    const applicationId = params.applicationId;

    // Get screening
    const screening = await AIScreeningService.getScreeningByApplicationId(applicationId);
    
    if (!screening) {
      return NextResponse.json(
        { error: 'No screening found for this application' },
        { status: 404 }
      );
    }

    // Get screening logs
    const logs = await AIScreeningService.getScreeningLogs(screening.id);

    return NextResponse.json({
      screening,
      logs
    });
  } catch (error: any) {
    console.error('Failed to get AI screening:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get AI screening' },
      { status: 500 }
    );
  }
}
