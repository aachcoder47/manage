// src/app/api/job-boards/naukri/api-key/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NaukriAPIKeyService } from '@/services/naukri-api-key.service';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { apiKey, apiSecret, companyId } = await request.json();

    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: 'API key and secret are required' }, { status: 400 });
    }

    const result = await NaukriAPIKeyService.storeAPIKey(
      userId,
      null, // organization_id can be null for now
      apiKey,
      apiSecret,
      companyId
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Naukri API key storage error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to store Naukri API key' },
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

    const result = await NaukriAPIKeyService.deleteAPIKey(userId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Naukri API key deletion error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete Naukri API key' },
      { status: 500 }
    );
  }
}
