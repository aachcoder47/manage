// src/app/api/job-boards/indeed/api-key/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { IndeedAPIKeyService } from '@/services/indeed-api-key.service';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { apiKey, apiSecret, publisherId } = await request.json();

    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: 'API key and secret are required' }, { status: 400 });
    }

    const result = await IndeedAPIKeyService.storeAPIKey(
      userId,
      null, // organization_id can be null for now
      apiKey,
      apiSecret,
      publisherId
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Indeed API key storage error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to store Indeed API key' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await IndeedAPIKeyService.deleteAPIKey(userId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Indeed API key deletion error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete Indeed API key' },
      { status: 500 }
    );
  }
}
