// src/app/api/ai-screening/retry/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AIScreeningService } from '@/services/ai-screening.service';

export async function POST(request: NextRequest) {
  try {
    // Retry all failed screenings
    await AIScreeningService.retryFailedScreenings();

    return NextResponse.json({
      success: true,
      message: 'Failed screenings retry initiated'
    });
  } catch (error: any) {
    console.error('Failed to retry screenings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retry screenings' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get screening statistics
    const stats = await AIScreeningService.getScreeningStats();

    return NextResponse.json({
      stats,
      message: 'Screening statistics retrieved successfully'
    });
  } catch (error: any) {
    console.error('Failed to get screening stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get screening stats' },
      { status: 500 }
    );
  }
}
