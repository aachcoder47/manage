import { NextRequest, NextResponse } from 'next/server';
import { emailTriggerService } from '@/services/email-trigger.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...params } = body;

    let result = false;

    switch (type) {
      case 'welcome':
        result = await emailTriggerService.sendWelcomeEmail(params);
        break;
      
      case 'application_received':
        result = await emailTriggerService.sendApplicationReceivedEmail(params);
        break;
      
      case 'interview_invite':
        result = await emailTriggerService.sendInterviewInviteEmail(params);
        break;
      
      case 'weekly_summary':
        result = await emailTriggerService.sendWeeklySummaryEmail(params);
        break;
      
      case 'password_reset':
        result = await emailTriggerService.sendPasswordResetEmail(params.email, params.resetLink);
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        );
    }

    if (result) {
      return NextResponse.json(
        { success: true, message: 'Email sent successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
