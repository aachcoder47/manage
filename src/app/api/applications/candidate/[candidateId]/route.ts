// src/app/api/applications/candidate/[candidateId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(
  request: NextRequest,
  { params }: { params: { candidateId: string } }
) {
  try {
    const candidateId = params.candidateId;

    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        job:jobs (
          *,
          organization:organizations (
            name,
            image_url
          )
        )
      `)
      .eq('user_id', candidateId)
      .eq('is_active', true)
      .order('applied_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: `Failed to fetch candidate applications: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ applications: data || [] });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch candidate applications' },
      { status: 500 }
    );
  }
}
