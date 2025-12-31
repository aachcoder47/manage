import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Use URL constructor instead of nextUrl.searchParams for static generation
    const url = new URL(request.url || 'http://localhost:3000');
    const status = url.searchParams.get('status');
    const organizationId = url.searchParams.get('organizationId');
    const userId = url.searchParams.get('userId');
    const jobId = url.searchParams.get('jobId');
    const limit = url.searchParams.get('limit');
    const offset = url.searchParams.get('offset');

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
      const apiUrl = `${supabaseUrl}/rest/v1/job?id=eq.${jobId}&select=*,organization(name,image_url)`;
      const response = await fetch(apiUrl, {
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
    let apiUrl = `${supabaseUrl}/rest/v1/job?select=*,organization(name,image_url)`;
    
    // Add filters
    if (status) {
      apiUrl += `&status=eq.${status}`;
    }
    if (organizationId) {
      apiUrl += `&organization_id=eq.${organizationId}`;
    }
    if (userId) {
      apiUrl += `&user_id=eq.${userId}`;
    }

    // Add ordering
    apiUrl += '&order=created_at.desc';

    // Add pagination
    if (limit) {
      apiUrl += `&limit=${limit}`;
    }
    if (offset) {
      apiUrl += `&offset=${offset}`;
    }

    const response = await fetch(apiUrl, {
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
