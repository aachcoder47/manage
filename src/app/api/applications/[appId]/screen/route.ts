// src/app/api/applications/[appId]/screen/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Mistral } from "@mistralai/mistralai";

export const dynamic = 'force-dynamic';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {return null;}
  return createClient(url, key);
}

function getMistral() {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {return null;}
  return new Mistral({ apiKey });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ appId: string }> }
) {
  try {
    const params = await context.params;
    const appId = params.appId;
    const supabase = getSupabase();
    const mistral = getMistral();

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

    // Start AI screening process
    const screeningData = {
      application_id: appId,
      applicant_name: application.applicant_name,
      applicant_email: application.applicant_email,
      job_title: application.job?.title,
      job_description: application.job?.description,
      resume_url: application.resume_url,
      cover_letter: application.cover_letter,
      screening_status: 'processing',
      started_at: new Date().toISOString()
    };

    // Create or update screening record
    const { data: screening, error: screeningError } = await supabase
      .from('ai_screening')
      .upsert({
        application_id: appId,
        screening_status: 'processing',
        screening_result: {},
        screening_score: 0.00,
        screening_model: 'mistral-7b',
        screening_version: '1.0',
        metadata: screeningData,
        is_active: true
      })
      .select()
      .single();

    if (screeningError) {
      console.error('Screening creation error:', screeningError);
      return NextResponse.json({ error: "Failed to start screening" }, { status: 500 });
    }

    // Process AI screening in background
    processAIScreening(screening.id, application, mistral, supabase).catch(error => {
      console.error('Background AI screening failed:', error);
    });

    return NextResponse.json({
      success: true,
      screening_id: screening.id,
      message: "AI screening started"
    });

  } catch (error: any) {
    console.error('Screening endpoint error:', error);
    return NextResponse.json(
      { error: error.message || "Failed to start screening" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ appId: string }> }
) {
  try {
    const params = await context.params;
    const appId = params.appId;
    const supabase = getSupabase();

    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    // Get screening results
    const { data: screening, error: screeningError } = await supabase
      .from('ai_screening')
      .select(`
        *,
        job_applications (
          applicant_name,
          applicant_email,
          job:jobs (
            title,
            description
          )
        )
      `)
      .eq('application_id', appId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (screeningError) {
      if (screeningError.code === 'PGRST116') {
        return NextResponse.json({ error: "No screening found for this application" }, { status: 404 });
      }
      throw screeningError;
    }

    // Get screening logs
    const { data: logs, error: logsError } = await supabase
      .from('ai_screening_logs')
      .select('*')
      .eq('screening_id', screening.id)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      screening,
      logs: logs || []
    });

  } catch (error: any) {
    console.error('Get screening error:', error);
    return NextResponse.json(
      { error: error.message || "Failed to get screening results" },
      { status: 500 }
    );
  }
}

async function processAIScreening(
  screeningId: string,
  application: any,
  mistral: Mistral | null,
  supabase: any
) {
  try {
    if (!mistral) {
      throw new Error('AI service not available');
    }

    // Prepare screening prompt
    const prompt = `
Please analyze this job application and provide a comprehensive screening assessment:

Applicant: ${application.applicant_name}
Email: ${application.applicant_email}
Job Title: ${application.job?.title}
Job Description: ${application.job?.description || 'Not provided'}
Cover Letter: ${application.cover_letter || 'Not provided'}

Please provide:
1. Overall match score (0-100)
2. Key skills assessment
3. Experience relevance
4. Communication quality
5. Recommendation (hire/interview/reject)

Respond in JSON format with:
{
  "score": 85,
  "skills_match": ["skill1", "skill2"],
  "experience_relevance": true,
  "communication_quality": "good",
  "recommendation": "interview",
  "reasoning": "Detailed explanation"
}
    `;

    // Call AI service
    const response = await mistral.chat.complete({
      model: "mistral-7b",
      messages: [{ role: "user", content: prompt }],
      maxTokens: 1000,
    });

    const messageContent = response.choices[0].message.content;
    const contentString = Array.isArray(messageContent) ? messageContent.join('') : (messageContent || '{}');
    const aiResult = JSON.parse(contentString);

    // Update screening with results
    await supabase
      .from('ai_screening')
      .update({
        screening_status: 'completed',
        screening_result: aiResult,
        screening_score: aiResult.score / 100,
        screening_reason: aiResult.reasoning,
        updated_at: new Date().toISOString()
      })
      .eq('id', screeningId);

    // Add success log
    await supabase
      .from('ai_screening_logs')
      .insert({
        screening_id: screeningId,
        log_level: 'info',
        log_message: 'AI screening completed successfully',
        log_data: aiResult
      });

  } catch (error: any) {
    console.error('AI screening processing error:', error);
    
    // Update screening with error
    await supabase
      .from('ai_screening')
      .update({
        screening_status: 'failed',
        error_message: error.message,
        error_code: 'AI_PROCESSING_ERROR',
        updated_at: new Date().toISOString()
      })
      .eq('id', screeningId);

    // Add error log
    await supabase
      .from('ai_screening_logs')
      .insert({
        screening_id: screeningId,
        log_level: 'error',
        log_message: `AI screening failed: ${error.message}`,
        log_data: { error_type: error.name }
      });
  }
}
