import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Use service role key for backend operations to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const { candidate_id, email } = payload;

    if (!candidate_id) {
        return NextResponse.json({ error: 'candidate_id is required' }, { status: 400 });
    }

    // 1. Ensure user exists in the "user" table to satisfy foreign key constraints
    // Since we are using Clerk, we use the Clerk ID as the primary key in our "user" table.
    const { error: userError } = await supabase
      .from('user')
      .upsert({ 
        id: candidate_id,
        email: email || null
      }, { onConflict: 'id' });

    if (userError) {
      console.error('Error ensuring user exists:', userError);
      // We don't necessarily want to fail here if the user might already exist, 
      // but if it's a real error (like table missing), it's good to know.
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
