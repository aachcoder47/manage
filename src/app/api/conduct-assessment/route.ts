import { NextRequest, NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';
import { createClient } from '@supabase/supabase-js';

// Use anon key instead of service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

// Helper function to debug available responses
async function getAvailableResponses(interviewId: string) {
  try {
    const { data } = await supabase
      .from('response')
      .select('id, interview_id, created_at')
      .eq('interview_id', interviewId);
    return data || [];
  } catch (error) {
    console.error('Error getting available responses:', error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Assessment submission received...');
    
    const { assessmentId, responseId, submissionData } = await request.json();
    
    console.log('📋 Submission details:', {
      assessmentId,
      responseId,
      hasSubmissionData: !!submissionData,
      submissionKeys: submissionData ? Object.keys(submissionData) : [],
      startTime: submissionData?.startTime,
      answersCount: submissionData?.answers ? Object.keys(submissionData.answers).length : 0,
      codeSubmissionsCount: submissionData?.codeSubmissions ? Object.keys(submissionData.codeSubmissions).length : 0
    });

    // Get assessment details
    const { data: assessment, error: assessmentError } = await supabase
      .from('skill_assessment')
      .select('*')
      .eq('id', assessmentId)
      .single();

    if (assessmentError || !assessment) {
      console.error('❌ Assessment not found:', assessmentError);
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    console.log('✅ Assessment found:', assessment.title);

    // Get candidate response details
    console.log('🔍 Looking up response:', responseId);
    const { data: response, error: responseError } = await supabase
      .from('response')
      .select('*')
      .eq('id', responseId)
      .single();

    if (responseError || !response) {
      console.error('❌ Response not found:', responseError);
      console.log('🔍 Available responses for interview:', await getAvailableResponses(assessment.interview_id));
      return NextResponse.json({ error: 'Response not found' }, { status: 404 });
    }

    console.log('✅ Response found:', response.id);

    // Check if this assessment has already been attempted by this response
    console.log('🔍 Checking for existing attempts...');
    const { data: existingAttempt, error: attemptError } = await supabase
      .from('candidate_assessment')
      .select('*')
      .eq('skill_assessment_id', assessmentId)
      .eq('response_id', responseId)
      .single();

    if (existingAttempt) {
      console.log('⚠️ Assessment already attempted:', existingAttempt.id);
      return NextResponse.json({
        error: 'Assessment already taken',
        message: 'You have already taken this assessment. Only one attempt is allowed.',
        existingAttempt
      }, { status: 403 }); // Forbidden
    }

    console.log('✅ No existing attempt found, proceeding...');

    // Get coding challenges if it's a coding assessment
    const { data: challenges } = await supabase
      .from('coding_challenge')
      .select('*')
      .eq('skill_assessment_id', assessmentId)
      .order('order_index');

    // Generate AI evaluation based on submission
    const prompt = `
Evaluate the following assessment submission:

Assessment Details:
- Title: ${assessment.title}
- Type: ${assessment.assessment_type}
- Difficulty: ${assessment.difficulty_level}
- Evaluation Criteria: ${JSON.stringify(assessment.evaluation_criteria)}

Candidate Submission:
${JSON.stringify(submissionData, null, 2)}

${challenges && challenges.length > 0 ? `
Coding Challenges:
${challenges.map((challenge, index) => `
Challenge ${index + 1}: ${challenge.title}
Description: ${challenge.description}
Expected Solution: ${challenge.solution_code || 'Not provided'}
Test Cases: ${JSON.stringify(challenge.test_cases || [])}
`).join('\n')}
` : ''}

Please evaluate this submission and provide:
1. Overall score (0-100)
2. Detailed feedback for each question/challenge
3. Strengths demonstrated
4. Areas for improvement
5. Specific code review (if applicable)
6. Time management assessment
7. Problem-solving approach analysis

Respond with JSON structure:
{
  "overall_score": 85,
  "max_score": 100,
  "passed": true,
  "detailed_feedback": [
    {
      "question_number": 1,
      "score": 90,
      "max_score": 100,
      "feedback": "Excellent solution with clean code",
      "strengths": ["Clean syntax", "Efficient algorithm"],
      "improvements": ["Add error handling"]
    }
  ],
  "strengths": ["Strong problem-solving skills", "Clean code structure"],
  "weaknesses": ["Missing edge case handling"],
  "recommendations": ["Focus on error handling", "Consider performance optimization"],
  "time_management": "Good time allocation",
  "problem_solving_approach": "Systematic and logical",
  "code_quality_score": 88,
  "communication_score": 82
}
`;

    console.log('🤖 Calling Mistral API for evaluation...');
    
    let completion;
    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
      try {
        completion = await mistral.chat.complete({
          model: "mistral-small-latest", // Use smaller model with higher capacity
          messages: [
            {
              role: "system",
              content: "You are an expert technical evaluator. Provide detailed, constructive feedback that helps candidates improve. Be fair but thorough in your assessment."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          responseFormat: { type: "json_object" }
        });
        break; // Success, exit retry loop
      } catch (error: any) {
        retries++;
        if (error.statusCode === 429 && retries < maxRetries) {
          console.log(`⏳ Rate limit hit, retrying in ${2 ** retries} seconds... (attempt ${retries}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 2000 * retries)); // Exponential backoff
        } else {
          throw error;
        }
      }
    }

    if (!completion) {
      throw new Error('Failed to get response from AI service after multiple attempts');
    }

    console.log('✅ Mistral evaluation response received');
    
    const content = completion.choices[0]?.message?.content;
    console.log('📄 Raw evaluation response type:', typeof content);
    
    if (!content || typeof content !== 'string') {
      console.error('❌ Invalid response from Mistral:', content);
      throw new Error('Invalid response from AI service');
    }

    const evaluation = JSON.parse(content);

    // Calculate time spent (if start time provided)
    const timeSpent = submissionData.startTime ? 
      Math.floor((Date.now() - new Date(submissionData.startTime).getTime()) / 1000) : 
      assessment.time_limit * 60; // Default to assessment time limit

    // Save candidate assessment result
    const { data: candidateAssessment, error: saveError } = await supabase
      .from('candidate_assessment')
      .insert({
        response_id: responseId,
        skill_assessment_id: assessmentId,
        started_at: submissionData.startTime ? new Date(submissionData.startTime).toISOString() : new Date().toISOString(),
        completed_at: new Date().toISOString(),
        score: evaluation.overall_score,
        max_score: evaluation.max_score || 100,
        passed: evaluation.passed || (evaluation.overall_score >= assessment.passing_score),
        submission_data: submissionData,
        evaluation_details: evaluation,
        time_spent: timeSpent
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving candidate assessment:', saveError);
      return NextResponse.json({ error: 'Failed to save assessment result' }, { status: 500 });
    }

    // Update response analytics with assessment results
    const existingAnalytics = response.analytics ? 
      (typeof response.analytics === 'string' ? JSON.parse(response.analytics) : response.analytics) : {};

    const updatedAnalytics = {
      ...existingAnalytics,
      assessment_results: {
        ...existingAnalytics.assessment_results,
        [assessmentId]: {
          score: evaluation.overall_score,
          passed: evaluation.passed,
          completed_at: new Date().toISOString(),
          evaluation: evaluation
        }
      },
      latest_assessment_score: evaluation.overall_score,
      code_quality_score: evaluation.code_quality_score,
      communication_score: evaluation.communication_score
    };

    await supabase
      .from('response')
      .update({ 
        analytics: JSON.stringify(updatedAnalytics),
        is_analysed: true 
      })
      .eq('id', responseId);

    return NextResponse.json({
      success: true,
      assessment: candidateAssessment,
      evaluation,
      insights: {
        strengths: evaluation.strengths || [],
        improvements: evaluation.weaknesses || [],
        recommendations: evaluation.recommendations || [],
        next_steps: evaluation.passed ? 
          "Candidate passed assessment. Consider moving to next interview stage." :
          "Candidate needs improvement. Consider additional training or reassessment."
      }
    });

  } catch (error) {
    console.error('Error conducting assessment:', error);
    return NextResponse.json(
      { error: 'Failed to conduct assessment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('assessmentId');
    const responseId = searchParams.get('responseId');

    if (!assessmentId || !responseId) {
      return NextResponse.json({ error: 'Missing assessmentId or responseId' }, { status: 400 });
    }

    // Get existing assessment result
    console.log('🔍 Checking for existing attempts...');
    const { data: existingAssessment } = await supabase
      .from('candidate_assessment')
      .select('*')
      .eq('skill_assessment_id', assessmentId)
      .eq('response_id', responseId)
      .single();

    if (existingAssessment) {
      console.log('⚠️ Assessment already attempted:', existingAssessment.id);
      return NextResponse.json({
        hasAttempted: true,
        assessment: existingAssessment,
        canRetake: false,
        message: 'You have already taken this assessment. Only one attempt is allowed.'
      });
    }

    // Get assessment details for starting new attempt
    const { data: assessment } = await supabase
      .from('skill_assessment')
      .select('*')
      .eq('id', assessmentId)
      .single();

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Get coding challenges if applicable
    const { data: challenges } = await supabase
      .from('coding_challenge')
      .select('*')
      .eq('skill_assessment_id', assessmentId)
      .order('order_index');

    return NextResponse.json({
      hasAttempted: false,
      assessment,
      challenges: challenges || [],
      canStart: true
    });

  } catch (error) {
    console.error('Error fetching assessment details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment details' },
      { status: 500 }
    );
  }
}
