import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { JobBoardIntegrationService } from '@/services/job-board-integration.service';

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const organizationId = searchParams.get('organization_id') || undefined;

    const integrations = await JobBoardIntegrationService.getUserIntegrations(
      userId,
      organizationId
    );

    // Remove sensitive data before sending to client
    const safeIntegrations = integrations.map((integration) => ({
      ...integration,
      access_token: null,
      refresh_token: null,
      api_key: null,
      api_secret: null,
    }));

    return NextResponse.json({ integrations: safeIntegrations });
  } catch (error: any) {
    console.error('Get integrations error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch integrations' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const integrationId = searchParams.get('integration_id');

    if (!integrationId) {
      return NextResponse.json({ error: 'integration_id is required' }, { status: 400 });
    }

    await JobBoardIntegrationService.disconnectIntegration(integrationId, userId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Disconnect integration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to disconnect integration' },
      { status: 500 }
    );
  }
}

