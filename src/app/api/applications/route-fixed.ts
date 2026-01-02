// src/app/api/applications/route.ts - Fixed version
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('job_id');
    const organizationId = searchParams.get('organization_id');
    const candidateId = searchParams.get('candidate_id');
    const platform = searchParams.get('platform');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query = supabase
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
      .eq('is_active', true);

    // Apply filters
    if (jobId) {
      query = query.eq('job_id', jobId);
    }
    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }
    if (candidateId) {
      query = query.eq('user_id', candidateId);
    }
    if (platform) {
      query = query.eq('platform', platform);
    }
    if (status) {
      query = query.eq('application_status', status);
    }
    if (search) {
      query = query.or(`applicant_name.ilike.%${search}%,applicant_email.ilike.%${search}%`);
    }

    const { data, error } = await query.order('applied_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: `Failed to fetch applications: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ applications: data || [] });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const applicationData = await request.json();

    // Validate required fields
    if (!applicationData.job_id || !applicationData.applicant_name || !applicationData.applicant_email) {
      return NextResponse.json(
        { error: 'Missing required fields: job_id, applicant_name, applicant_email' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('job_applications')
      .insert({
        job_id: applicationData.job_id,
        user_id: applicationData.user_id,
        organization_id: applicationData.organization_id || null,
        external_posting_id: applicationData.external_posting_id || null,
        platform: applicationData.platform || 'direct',
        platform_application_id: applicationData.platform_application_id || null,
        applicant_name: applicationData.applicant_name,
        applicant_email: applicationData.applicant_email,
        applicant_phone: applicationData.applicant_phone || null,
        applicant_linkedin: applicationData.applicant_linkedin || null,
        resume_url: applicationData.resume_url || null,
        cover_letter: applicationData.cover_letter || null,
        application_status: 'pending',
        application_source: applicationData.application_source || 'external',
        applied_at: new Date().toISOString(),
        last_status_change_at: new Date().toISOString(),
        notes: applicationData.notes || null,
        metadata: applicationData.metadata || {},
        is_active: true,
      })
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
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: `Failed to create application: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ application: data });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create application' },
      { status: 500 }
    );
  }
}
