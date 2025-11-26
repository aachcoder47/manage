import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use anon key instead of service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const interviewId = searchParams.get('interviewId');

    if (!interviewId) {
      return NextResponse.json(
        { error: 'Interview ID is required' },
        { status: 400 }
      );
    }

    console.log('📊 Fetching responses for interview:', interviewId);

    // Get all responses for the interview
    const { data: responses, error: responsesError } = await supabase
      .from('response')
      .select('*')
      .eq('interview_id', interviewId)
      .order('created_at', { ascending: false });

    if (responsesError) {
      console.error('❌ Error fetching responses:', responsesError);
      return NextResponse.json(
        { error: 'Failed to fetch responses' },
        { status: 500 }
      );
    }

    console.log(`✅ Found ${responses?.length || 0} responses`);

    // Process analytics data
    const processedResponses = responses?.map(response => {
      const analytics = typeof response.analytics === 'string' 
        ? JSON.parse(response.analytics) 
        : response.analytics || {};

      return {
        ...response,
        analytics: {
          overall_score: analytics.overall_score || 0,
          communication_score: analytics.communication_score || 0,
          technical_score: analytics.technical_score || 0,
          problem_solving_score: analytics.problem_solving_score || 0,
          assessment_results: analytics.assessment_results || {},
          latest_assessment_score: analytics.latest_assessment_score || 0,
          code_quality_score: analytics.code_quality_score || 0,
          ...analytics
        }
      };
    }) || [];

    return NextResponse.json({
      responses: processedResponses,
      total: processedResponses.length,
      interviewId
    });

  } catch (error) {
    console.error('Error in responses API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { interviewId, candidateData, analytics } = body;

    if (!interviewId) {
      return NextResponse.json(
        { error: 'Interview ID is required' },
        { status: 400 }
      );
    }

    console.log('📝 Creating response for interview:', interviewId);

    const { data: response, error } = await supabase
      .from('response')
      .insert({
        interview_id: interviewId,
        details: JSON.stringify(candidateData || {}),
        analytics: JSON.stringify(analytics || {}),
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating response:', error);
      return NextResponse.json(
        { error: 'Failed to create response' },
        { status: 500 }
      );
    }

    console.log('✅ Response created successfully:', response.id);

    return NextResponse.json({
      response,
      message: 'Response created successfully'
    });

  } catch (error) {
    console.error('Error in responses POST API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
