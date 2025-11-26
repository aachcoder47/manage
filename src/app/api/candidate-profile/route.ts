import { NextRequest, NextResponse } from "next/server";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Mistral } from "@mistralai/mistralai";
import { logger } from "@/lib/logger";

const supabase = createClientComponentClient();
const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const responseId = searchParams.get("responseId");

    if (!responseId) {
      return NextResponse.json(
        { error: "Response ID is required" },
        { status: 400 }
      );
    }

    const { data: profile, error } = await supabase
      .from("candidate_profile")
      .select("*")
      .eq("response_id", responseId)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found error
      throw error;
    }

    logger.info(`Fetched candidate profile for response ${responseId}`);

    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    logger.error("Error fetching candidate profile", error as Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { responseId, profileData, generateSummary = false } = body;

    if (!responseId) {
      return NextResponse.json(
        { error: "Response ID is required" },
        { status: 400 }
      );
    }

    // Generate AI summary if requested
    let aiSummary = profileData.ai_generated_summary;
    if (generateSummary && !aiSummary) {
      aiSummary = await generateCandidateSummary(profileData);
    }

    const profilePayload = {
      ...profileData,
      ai_generated_summary: aiSummary,
      response_id: responseId
    };

    const { data: profile, error } = await supabase
      .from("candidate_profile")
      .upsert(profilePayload, {
        onConflict: 'response_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) throw error;

    logger.info(`Created/updated candidate profile for response ${responseId}`);

    return NextResponse.json(
      { profile, message: "Candidate profile saved successfully" },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Error saving candidate profile", error as Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { responseId, profileData, generateSummary = false } = body;

    if (!responseId) {
      return NextResponse.json(
        { error: "Response ID is required" },
        { status: 400 }
      );
    }

    // Generate AI summary if requested
    let aiSummary = profileData.ai_generated_summary;
    if (generateSummary && !aiSummary) {
      aiSummary = await generateCandidateSummary(profileData);
    }

    const { data: profile, error } = await supabase
      .from("candidate_profile")
      .update({
        ...profileData,
        ai_generated_summary: aiSummary,
        updated_at: new Date().toISOString()
      })
      .eq("response_id", responseId)
      .select()
      .single();

    if (error) throw error;

    logger.info(`Updated candidate profile for response ${responseId}`);

    return NextResponse.json(
      { profile, message: "Candidate profile updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error updating candidate profile", error as Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function generateCandidateSummary(profileData: any): Promise<string> {
  try {
    const prompt = `Generate a concise professional summary for this candidate based on their profile:

Candidate Information:
- Experience: ${profileData.experience_years || 'Not specified'} years
- Skills: ${profileData.skills?.join(', ') || 'Not specified'}
- Location: ${profileData.location || 'Not specified'}
- Expected Salary: ${profileData.expected_salary || 'Not specified'}

Education:
${JSON.stringify(profileData.education || [], null, 2)}

Work Experience:
${JSON.stringify(profileData.work_experience || [], null, 2)}

Please generate a 2-3 sentence professional summary that highlights:
1. Key experience and skills
2. Career level and expertise areas
3. Notable achievements or background

Keep it professional and concise.`;

    const completion = await mistral.chat.complete({
      model: "mistral-large-latest",
      messages: [
        {
          role: "system",
          content: "You are an expert resume writer and career counselor. Generate professional, concise candidate summaries."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const content = completion.choices[0]?.message?.content;
    return String(content || "Professional summary not available.");
  } catch (error) {
    console.error("Error generating candidate summary:", error);
    return "Professional summary not available.";
  }
}
