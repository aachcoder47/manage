import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    console.warn('Supabase credentials missing during initialization');
    return null;
  }
  
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing database credentials' },
        { status: 500 }
      );
    }

    const payload = await request.json();
    const { candidate_id, email } = payload;

    if (!candidate_id) {
        return NextResponse.json({ error: 'candidate_id is required' }, { status: 400 });
    }

    // 1. Ensure user exists
    const { error: userError } = await supabase
      .from('user')
      .upsert({ 
        id: candidate_id,
        email: email || null
      }, { onConflict: 'id' });

    if (userError) {
      console.error('Error ensuring user exists:', userError);
    }

    // 2. Create the application
    const { data, error } = await supabase
      .from('job_application')
      .insert(payload)
      .select()
      .single();

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
