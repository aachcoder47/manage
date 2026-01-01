import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { JobBoardPostingService } from '@/services/job-board-posting.service';
import { JobBoardIntegrationService } from '@/services/job-board-integration.service';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { job_id, integration_ids, apply_url } = body;

    if (!job_id || !integration_ids || !Array.isArray(integration_ids) || integration_ids.length === 0) {
      return NextResponse.json(
        { error: 'job_id and integration_ids array are required' },
        { status: 400 }
      );
    }

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('job')
      .select('*')
      .eq('id', job_id)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Verify user has access to this job
    const userRow = await supabase
      .from('user')
      .select('organization_id')
      .eq('id', userId)
      .single();

    if (userRow.error || !userRow.data) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (job.organization_id !== userRow.data.organization_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Generate apply URL - redirects to your website with source tracking
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    // Use find-jobs page which has the application form
    // Source tracking will be added per platform in the posting service
    const defaultApplyUrl = `${baseUrl}/find-jobs/${job_id}`;
    const finalApplyUrl = apply_url || defaultApplyUrl;

    // Post to all requested platforms
    const results = await JobBoardPostingService.postToMultiplePlatforms(
      integration_ids,
      job,
      finalApplyUrl
    );

    // Save posting records
    const postingRecords: any[] = [];
    for (let i = 0; i < integration_ids.length; i++) {
      const integrationId = integration_ids[i];
      const result = results[i];

      const posting = await JobBoardIntegrationService.createExternalPosting({
        job_id: job_id,
        integration_id: integrationId,
        user_id: userId,
        organization_id: job.organization_id,
        platform: result.platform,
        external_job_id: result.external_job_id || undefined,
        external_job_url: result.external_job_url || undefined,
        posting_status: result.success ? 'posted' : 'failed',
        response_data: result.response_data || {},
        metadata: {
          error: result.error,
          error_code: result.error_code,
        },
      });

      postingRecords.push(posting);

      // Update posting status if we have more details
      if (result.success && result.external_job_id) {
        await JobBoardIntegrationService.updateExternalPosting(posting.id, {
          posted_at: new Date().toISOString(),
        });
      } else if (!result.success) {
        await JobBoardIntegrationService.updateExternalPosting(posting.id, {
          error_message: result.error,
          error_code: result.error_code,
        });
      }
    }

    return NextResponse.json({
      success: true,
      results: results.map((r, i) => ({
        ...r,
        posting_id: postingRecords[i].id,
      })),
    });
  } catch (error: any) {
    console.error('Post job error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to post job' },
      { status: 500 }
    );
  }
}

