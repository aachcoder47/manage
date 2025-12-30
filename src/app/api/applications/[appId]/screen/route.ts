import { NextRequest, NextResponse } from "next/server";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Mistral } from "@mistralai/mistralai";
import { parsePdfFromBuffer } from "@/actions/parse-pdf";
import axios from "axios";

export const dynamic = 'force-dynamic';

// Lazy initialization helpers
function getSupabase() {
  return createClientComponentClient();
}

function getMistral() {
  return new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { appId: string } }
) {
  try {
    const supabase = getSupabase();
    const mistral = getMistral();

    // 1. Fetch Application
    const { data: application, error: appError } = await supabase
      .from("job_application")
      .select("*, job(*)")
      .eq("id", params.appId)
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (!application.resume_url) {
      return NextResponse.json({ error: "No resume found for this application" }, { status: 400 });
    }

    // 2. Fetch and Parse Resume
    const response = await axios.get(application.resume_url, { responseType: 'arraybuffer' });
    const pdfResult = await parsePdfFromBuffer(response.data);

    if (!pdfResult.success || !pdfResult.text) {
      return NextResponse.json({ error: "Failed to parse resume PDF" }, { status: 422 });
    }

    // 3. AI Screening with Mistral
    const jobDescription = application.job.description + "\n\nRequirements:\n" + (application.job.requirements || "");
    const resumeText = pdfResult.text;

    const prompt = `
      You are an expert recruiter. Analyze the candidate's resume against the job description provided.
      
      JOB DESCRIPTION:
      ${jobDescription}
      
      CANDIDATE RESUME:
      ${resumeText}
      
      Provide a screening score (0-100) based on how well the candidate matches the requirements.
      Also provide 20-30 words of feedback/notes summarizing their fit, strengths, and any missing skills.
      
      Response Format (JSON only):
      {
        "score": number,
        "notes": "string"
      }
    `;

    const completion = await mistral.chat.complete({
      model: "mistral-large-latest",
      messages: [
        { role: "system", content: "You are a professional HR Screening AI. Respond only in JSON." },
        { role: "user", content: prompt }
      ],
      responseFormat: { type: "json_object" }
    });

    const resultBody = completion.choices[0]?.message?.content;
    if (!resultBody || typeof resultBody !== 'string') {
        throw new Error("Invalid response from AI");
    }
    const result = JSON.parse(resultBody);

    // 4. Update Application
    const { error: updateError } = await supabase
      .from("job_application")
      .update({
        screening_score: result.score,
        screening_notes: result.notes
      })
      .eq("id", params.appId);

    if (updateError) throw updateError;

    return NextResponse.json({ 
      success: true, 
      score: result.score, 
      notes: result.notes 
    });

  } catch (error: any) {
    console.error("Screening Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
