import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const organizationId = searchParams.get('organizationId');
    const userId = searchParams.get('userId');
    const jobId = searchParams.get('jobId');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    // Build the Supabase REST API URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    // Handle single job request
    if (jobId) {
      const url = `${supabaseUrl}/rest/v1/job?id=eq.${jobId}&select=*,organization(name,image_url)`;
      const response = await fetch(url, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch job' },
          { status: response.status }
        );
      }

      const job = await response.json();
      
      if (job.length === 0) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(job[0], { status: 200 });
    }

    // Build query for multiple jobs
    let url = `${supabaseUrl}/rest/v1/job?select=*,organization(name,image_url)`;
    
    // Add filters
    if (status) {
      url += `&status=eq.${status}`;
    }
    if (organizationId) {
      url += `&organization_id=eq.${organizationId}`;
    }
    if (userId) {
      url += `&user_id=eq.${userId}`;
    }

    // Add ordering
    url += '&order=created_at.desc';

    // Add pagination
    if (limit) {
      url += `&limit=${limit}`;
    }
    if (offset) {
      url += `&offset=${offset}`;
    }

    const response = await fetch(url, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch jobs' },
        { status: response.status }
      );
    }

    const jobs = await response.json();
    return NextResponse.json(jobs, { status: 200 });
  } catch (error) {
    console.error('Jobs API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
