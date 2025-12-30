import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { EmailService } from '@/services/email.service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: 'Server configuration error: Missing database credentials' },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const payload = await request.json();
    const { candidate_id, email, phone } = payload;

    if (!candidate_id) {
      return NextResponse.json({ error: 'candidate_id is required' }, { status: 400 });
    }

    // 1. Ensure user exists and has email
    if (email) {
      await supabase
        .from('user')
        .upsert({ 
          id: candidate_id,
          email: email
        }, { onConflict: 'id' });
    }

    // 2. Prepare the application payload
    // We try to insert all fields. If it fails because columns like 'email' or 'phone' 
    // are missing in the schema, we retry without them.
    let { data, error } = await supabase
      .from('job_application')
      .insert(payload)
      .select()
      .single();

    if (error && error.message.includes("Could not find the 'email' column")) {
      console.warn('Email/Phone columns missing in job_application table, retrying without them...');
      
      const { email: _e, phone: _p, ...fallbackPayload } = payload;
      const retry = await supabase
        .from('job_application')
        .insert(fallbackPayload)
        .select()
        .single();
      
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error('Error creating application:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    try {
      const jobId = data.job_id;
      const { data: job } = await supabase
        .from('job')
        .select('id, title, organization_id, organization(name)')
        .eq('id', jobId)
        .single();

      const organizationName = ((job as any)?.organization?.[0]?.name ?? (job as any)?.organization?.name) as
        | string
        | undefined;

      const candidateEmail = email || data.email;
      const candidatePhone = phone || data.phone;

      if (candidateEmail) {
        await EmailService.trackJobApplicationSubmitted({
          applicationId: data.id,
          jobId: jobId,
          jobTitle: job?.title,
          organizationId: job?.organization_id,
          organizationName,
          candidateId: candidate_id,
          candidateEmail,
          candidatePhone,
        });
      }

      if (job?.organization_id) {
        let employerEmail: string | undefined;

        const employerByRole = await supabase
          .from('user')
          .select('email')
          .eq('organization_id', job.organization_id)
          .eq('role', 'employer')
          .limit(1)
          .maybeSingle();

        employerEmail = employerByRole.data?.email;

        if (!employerEmail) {
          const anyUser = await supabase
            .from('user')
            .select('email')
            .eq('organization_id', job.organization_id)
            .limit(1)
            .maybeSingle();
          employerEmail = anyUser.data?.email;
        }

        if (employerEmail && candidateEmail) {
          await EmailService.trackEmployerNewApplicant(employerEmail, {
            applicationId: data.id,
            jobId: jobId,
            jobTitle: job?.title,
            organizationId: job?.organization_id,
            organizationName,
            candidateId: candidate_id,
            candidateEmail,
            candidatePhone,
          });
        }
      }
    } catch (e) {
      console.warn('MailerLite application automations failed:', e);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in applications API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
