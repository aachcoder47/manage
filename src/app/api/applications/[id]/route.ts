// src/app/api/applications/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { JobApplicationsService } from '@/services/job-applications.service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const applicationId = params.id;

    // Get application details
    const applications = await JobApplicationsService.searchApplications({
      search: applicationId,
    });

    if (applications.length === 0) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const application = applications[0];

    // Get application status history
    const statusHistory = await JobApplicationsService.getApplicationStatusHistory(applicationId);

    // Get application communications
    const communications = await JobApplicationsService.getApplicationCommunications(applicationId);

    return NextResponse.json({
      application,
      statusHistory,
      communications,
    });
  } catch (error: any) {
    console.error('Failed to fetch application:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch application' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const applicationId = params.id;
    const { status, change_reason, notes } = await request.json();

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    await JobApplicationsService.updateApplicationStatus(
      applicationId,
      status,
      userId,
      change_reason,
      notes
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to update application:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update application' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const applicationId = params.id;

    await JobApplicationsService.deleteApplication(applicationId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete application:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete application' },
      { status: 500 }
    );
  }
}
