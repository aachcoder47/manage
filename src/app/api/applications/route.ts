import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in applications API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
