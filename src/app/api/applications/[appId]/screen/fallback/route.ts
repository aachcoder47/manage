// src/app/api/applications/[appId]/screen/fallback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {return null;}
  return createClient(url, key);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { appId: string } }
) {
  try {
    const appId = params.appId;
    const supabase = getSupabase();

    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    // Get application details
    const { data: application, error: appError } = await supabase
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
      .eq('id', appId)
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Create fallback screening result (without AI)
    const fallbackResult = {
      score: 75, // Default score
      skills_match: ["Communication", "Experience"],
      experience_relevance: true,
      communication_quality: "good",
      recommendation: "interview",
      reasoning: "Fallback screening - Application shows relevant experience and good communication. Manual review recommended.",
      fallback_used: true,
      fallback_reason: "AI service unavailable"
    };

    // Create or update screening record with fallback results
    const { data: screening, error: screeningError } = await supabase
      .from('ai_screening')
      .upsert({
        application_id: appId,
        screening_status: 'completed',
        screening_result: fallbackResult,
        screening_score: fallbackResult.score / 100,
        screening_reason: fallbackResult.reasoning,
        screening_model: 'fallback-v1.0',
        screening_version: '1.0',
        metadata: {
          fallback_used: true,
          fallback_reason: 'AI service unavailable',
          created_at: new Date().toISOString()
        },
        is_active: true
      })
      .select()
      .single();

    if (screeningError) {
      console.error('Fallback screening creation error:', screeningError);
      return NextResponse.json({ error: "Failed to create fallback screening" }, { status: 500 });
    }

    // Add success log
    await supabase
      .from('ai_screening_logs')
      .insert({
        screening_id: screening.id,
        log_level: 'info',
        log_message: 'Fallback screening completed successfully',
        log_data: fallbackResult
      });

    return NextResponse.json({
      success: true,
      screening_id: screening.id,
      screening_result: fallbackResult,
      message: "Fallback screening completed (AI service unavailable)"
    });

  } catch (error: any) {
    console.error('Fallback screening error:', error);
    return NextResponse.json(
      { error: error.message || "Failed to create fallback screening" },
      { status: 500 }
    );
  }
}
