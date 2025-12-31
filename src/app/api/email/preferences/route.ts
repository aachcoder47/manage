import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/services/email.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const organizationId = searchParams.get('organizationId');

    if (!userId || !organizationId) {
      return NextResponse.json(
        { error: 'userId and organizationId are required' },
        { status: 400 }
      );
    }

    const preferences = await emailService.getUserEmailPreferences(userId, organizationId);

    return NextResponse.json(
      { preferences },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get email preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to get email preferences' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, organizationId, preferences } = body;

    if (!userId || !organizationId || !preferences) {
      return NextResponse.json(
        { error: 'userId, organizationId, and preferences are required' },
        { status: 400 }
      );
    }

    const success = await emailService.updateUserEmailPreferences(userId, organizationId, preferences);

    if (success) {
      return NextResponse.json(
        { success: true, message: 'Email preferences updated successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to update email preferences' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Update email preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to update email preferences' },
      { status: 500 }
    );
  }
}
