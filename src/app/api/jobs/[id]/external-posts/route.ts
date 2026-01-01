import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Fetch external posts for this job - use correct table name
    const { data: externalPosts, error } = await supabase
      .from('external_job_posting') // Use singular table name
      .select('*')
      .eq('job_id', jobId)
      .eq('posting_status', 'posted') // Use posting_status instead of status
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching external posts:', error);
      return NextResponse.json({ error: 'Failed to fetch external posts' }, { status: 500 });
    }

    return NextResponse.json({
      posts: externalPosts || []
    });

  } catch (error) {
    console.error('Error in external posts API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
