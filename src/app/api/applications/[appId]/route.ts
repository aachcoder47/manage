// src/app/api/applications/[appId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ appId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const applicationId = params.appId;

    // Get application details
    const { data: application, error } = await supabase
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
      .eq('id', applicationId)
      .single();

    if (error || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Get application status history
    const { data: statusHistory } = await supabase
      .from('application_status_history')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false });

    // Get application communications
    const { data: communications } = await supabase
      .from('application_communications')
      .select('*')
      .eq('application_id', applicationId)
      .order('sent_at', { ascending: false });

    return NextResponse.json({
      application,
      statusHistory: statusHistory || [],
      communications: communications || []
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
  context: { params: Promise<{ appId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const applicationId = params.appId;
    const { status, change_reason, notes } = await request.json();

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Get current application status
    const { data: currentApp } = await supabase
      .from('job_applications')
      .select('application_status')
      .eq('id', applicationId)
      .single();

    // Update application status
    const { error: updateError } = await supabase
      .from('job_applications')
      .update({
        application_status: status,
        last_status_change_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId);

    if (updateError) {
      throw new Error(`Failed to update application status: ${updateError.message}`);
    }

    // Create status history record
    const { error: historyError } = await supabase
      .from('application_status_history')
      .insert({
        application_id: applicationId,
        old_status: currentApp?.application_status,
        new_status: status,
        changed_by: userId,
        change_reason: change_reason || null,
        notes: notes || null,
      });

    if (historyError) {
      console.error('Failed to create status history:', historyError);
    }

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
  context: { params: Promise<{ appId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const applicationId = params.appId;

    // Soft delete application
    const { error } = await supabase
      .from('job_applications')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId);

    if (error) {
      throw new Error(`Failed to delete application: ${error.message}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete application:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete application' },
      { status: 500 }
    );
  }
}
