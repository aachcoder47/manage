import { NextRequest, NextResponse } from 'next/server';
import { emailTriggerService } from '@/services/email-trigger.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, type } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    let result = false;
    let message = '';

    switch (type) {
      case 'rejection':
        result = await emailTriggerService.sendRejectionEmail({
          candidateName: 'Test Candidate',
          positionTitle: 'Test Position',
          organizationName: 'Test Company',
          recipientEmail: email,
          userId: 'test-user-id',
          organizationId: 'test-org-id',
          rejectionReason: 'Test rejection reason'
        });
        message = 'Rejection email test';
        break;
      
      case 'offer':
        result = await emailTriggerService.sendOfferEmail({
          candidateName: 'Test Candidate',
          positionTitle: 'Test Position',
          organizationName: 'Test Company',
          recipientEmail: email,
          userId: 'test-user-id',
          organizationId: 'test-org-id',
          salary: '$80,000 - $100,000',
          startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          offerDetails: 'Test offer details',
          acceptanceDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
        });
        message = 'Offer email test';
        break;
      
      default:
        result = await emailTriggerService.sendWelcomeEmail({
          name: 'Test User',
          userEmail: email,
          userId: 'test-user-id',
          organizationId: 'test-org-id'
        });
        message = 'Welcome email test';
    }

    if (result) {
      return NextResponse.json(
        { 
          success: true, 
          message: `${message} sent successfully to ${email}`,
          timestamp: new Date().toISOString()
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { 
          error: 'Failed to send email',
          message: `${message} failed to send`,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Test email API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Email test API endpoint',
    usage: 'POST with { email: "test@example.com", type: "rejection|offer|welcome" }',
    timestamp: new Date().toISOString()
  });
}
