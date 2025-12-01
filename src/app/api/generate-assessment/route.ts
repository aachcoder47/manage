import { NextRequest, NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';
import { createClient } from '@supabase/supabase-js';

// Check if environment variables are set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Use anon key instead

console.log('🔑 Environment Variables Check:');
console.log('SUPABASE_URL:', supabaseUrl ? '✅ Found' : '❌ Missing');
console.log('SUPABASE_ANON_KEY:', supabaseKey ? `✅ Found (${supabaseKey.substring(0, 20)}...)` : '❌ Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables:', {
    supabaseUrl: !!supabaseUrl,
    supabaseKey: !!supabaseKey
  });
}

const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || ''
);

// Test Supabase connection
console.log('🔗 Testing Supabase connection...');
supabase.from('interview').select('count').then(result => {
  if (result.error) {
    console.error('❌ Supabase connection failed:', result.error);
  } else {
    console.log('✅ Supabase connection successful');
  }
});

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

export async function POST(request: NextRequest) {
  // Check if environment variables are set
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: 'Server configuration error: Missing database credentials' },
      { status: 500 }
    );
  }

  try {
    console.log('🔍 Starting assessment generation...');
    
    const { interviewId, assessmentType, difficulty, skills, jobRole, questionType } = await request.json();
    
    console.log('📋 Request data:', { interviewId, assessmentType, difficulty, questionType });

    // Get interview details
    const { data: interview, error: interviewError } = await supabase
      .from('interview')
      .select('*')
      .eq('id', interviewId)
      .single();

    if (interviewError || !interview) {
      console.error('❌ Interview not found:', interviewError);
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }

    console.log('✅ Interview found:', interview.name);

    // Get existing responses to understand candidate level
    const { data: responses } = await supabase
      .from('response')
      .select('details, analytics')
      .eq('interview_id', interviewId)
      .limit(5);

    // Generate specialized prompts based on question type
    let prompt = '';
    
    if (questionType === 'coding') {
      prompt = `
Generate comprehensive coding challenges for a software engineering assessment:

Role: ${jobRole || interview.name || 'Software Developer'}
Difficulty: ${difficulty}
Required Skills: ${skills?.join(', ') || 'JavaScript, React, Node.js'}
Interview Description: ${interview.description || 'Not specified'}

Based on existing candidate performance:
${responses?.map(r => {
  const details = typeof r.details === 'string' ? JSON.parse(r.details) : r.details;
  const analytics = typeof r.analytics === 'string' ? JSON.parse(r.analytics) : r.analytics;
  return `- Overall Score: ${analytics.overall_score || 'N/A'}, Communication: ${analytics.communication_score || 'N/A'}`;
}).join('\n') || 'No existing responses'}

Generate 5 coding challenges with:
1. Progressive difficulty (easy to hard)
2. Real-world scenarios
3. Clear problem statements
4. Example input/output
5. Starter code templates
6. Solution code
7. Test cases
8. Time allocation per challenge

Format as JSON:
{
  "title": "Advanced Coding Assessment",
  "description": "Comprehensive coding challenges for ${jobRole || 'Software Developer'}",
  "instructions": "Solve the following coding problems...",
  "questions": [
    {
      "question": "Problem statement",
      "type": "coding",
      "starter_code": "// Starter template",
      "solution_code": "// Complete solution",
      "test_cases": [{"input": "test", "output": "expected"}],
      "expected_answer": "What the solution should accomplish",
      "points": 100,
      "time_minutes": 15
    }
  ],
  "evaluation_criteria": {
    "code_quality": 30,
    "problem_solving": 25,
    "efficiency": 20,
    "best_practices": 15,
    "readability": 10
  },
  "total_time_minutes": 75,
  "passing_score": 70
}`;
    } else if (questionType === 'mcq') {
      prompt = `
Generate comprehensive multiple-choice questions for technical assessment:

Role: ${jobRole || interview.name || 'Software Developer'}
Difficulty: ${difficulty}
Required Skills: ${skills?.join(', ') || 'JavaScript, React, Node.js'}
Interview Description: ${interview.description || 'Not specified'}

Based on existing candidate performance:
${responses?.map(r => {
  const details = typeof r.details === 'string' ? JSON.parse(r.details) : r.details;
  const analytics = typeof r.analytics === 'string' ? JSON.parse(r.analytics) : r.analytics;
  return `- Overall Score: ${analytics.overall_score || 'N/A'}, Communication: ${analytics.communication_score || 'N/A'}`;
}).join('\n') || 'No existing responses'}

Generate 10 multiple-choice questions covering:
1. Core concepts and fundamentals
2. Practical implementation scenarios
3. Best practices and patterns
4. Debugging and problem-solving
5. Advanced topics

Each question should have:
- Clear question text
- 4 plausible options (A, B, C, D)
- One correct answer
- Explanation of why it's correct
- Difficulty-appropriate complexity

Format as JSON:
{
  "title": "Technical Knowledge Assessment",
  "description": "Comprehensive MCQ assessment for ${jobRole || 'Software Developer'}",
  "instructions": "Choose the best answer for each question...",
  "questions": [
    {
      "question": "What is the correct answer?",
      "type": "mcq",
      "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
      "correct_answer": "B",
      "explanation": "Explanation of why B is correct",
      "points": 10,
      "time_minutes": 2
    }
  ],
  "evaluation_criteria": {
    "technical_accuracy": 40,
    "conceptual_understanding": 30,
    "practical_knowledge": 20,
    "problem_solving": 10
  },
  "total_time_minutes": 20,
  "passing_score": 75
}`;
    } else {
      // Default comprehensive assessment
      prompt = `
Generate a comprehensive ${assessmentType} assessment for the following role:

Role: ${jobRole || interview.name || 'Software Engineer'}
Difficulty: ${difficulty}
Required Skills: ${skills?.join(', ') || 'Not specified'}
Interview Description: ${interview.description || 'Not specified'}
Interview Objective: ${interview.objective || 'Not specified'}

Based on the existing candidate responses, here's the current candidate level:
${responses?.map(r => {
  const details = typeof r.details === 'string' ? JSON.parse(r.details) : r.details;
  const analytics = typeof r.analytics === 'string' ? JSON.parse(r.analytics) : r.analytics;
  return `- Overall Score: ${analytics.overall_score || 'N/A'}, Communication: ${analytics.communication_score || 'N/A'}`;
}).join('\n') || 'No existing responses'}

Generate a detailed assessment with:
1. Assessment title and description
2. 5-8 relevant questions/challenges
3. Evaluation criteria with scoring
4. Time allocation
5. Instructions for candidates
6. Expected difficulty level

Format as JSON with the following structure:
{
  "title": "Assessment Title",
  "description": "Detailed description",
  "instructions": "Step-by-step instructions",
  "questions": [
    {
      "question": "Question text",
      "type": "coding|technical|behavioral",
      "expected_answer": "What to look for",
      "points": 100,
      "time_minutes": 10
    }
  ],
  "evaluation_criteria": {
    "technical_accuracy": 30,
    "problem_solving": 25,
    "code_quality": 20,
    "communication": 15,
    "efficiency": 10
  },
  "total_time_minutes": 45,
  "passing_score": 70
}`;
    }

    console.log('🤖 Calling Mistral API...');
    console.log('📝 Prompt length:', prompt.length);

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
              content: "You are an expert technical assessment designer. Create comprehensive, role-appropriate assessments that accurately evaluate candidate skills."
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

    console.log('✅ Mistral API response received');
    
    const content = completion.choices[0]?.message?.content;
    console.log('📄 Raw response type:', typeof content);
    
    if (!content || typeof content !== 'string') {
      console.error('❌ Invalid response from Mistral:', content);
      throw new Error('Invalid response from AI service');
    }

    const generatedAssessment = JSON.parse(content);
    console.log('🎯 Generated assessment title:', generatedAssessment.title);
    console.log('📋 Generated assessment structure:', Object.keys(generatedAssessment));
    console.log('❓ Questions generated:', generatedAssessment.questions ? generatedAssessment.questions.length : 0);
    
    if (generatedAssessment.questions) {
      console.log('📝 First question sample:', JSON.stringify(generatedAssessment.questions[0], null, 2));
    }

    // Fallback: If no questions generated, create sample questions
    if (!generatedAssessment.questions || generatedAssessment.questions.length === 0) {
      console.log('⚠️ No questions generated by AI, creating fallback questions...');
      
      if (questionType === 'coding') {
        generatedAssessment.questions = [
          {
            question: "Write a function that reverses a string in JavaScript",
            type: "coding",
            starter_code: "function reverseString(str) {\n  // Your code here\n}",
            solution_code: "function reverseString(str) {\n  return str.split('').reverse().join('');\n}",
            test_cases: [{input: "hello", output: "olleh"}, {input: "world", output: "dlrow"}],
            expected_answer: "Function should reverse the input string",
            points: 100,
            time_minutes: 10
          },
          {
            question: "Implement a function to check if a number is prime",
            type: "coding", 
            starter_code: "function isPrime(n) {\n  // Your code here\n}",
            solution_code: "function isPrime(n) {\n  if (n <= 1) return false;\n  for (let i = 2; i <= Math.sqrt(n); i++) {\n    if (n % i === 0) return false;\n  }\n  return true;\n}",
            test_cases: [{input: 7, output: true}, {input: 4, output: false}],
            expected_answer: "Function should return true for prime numbers",
            points: 100,
            time_minutes: 15
          }
        ];
      } else if (questionType === 'mcq') {
        generatedAssessment.questions = [
          {
            question: "What is the time complexity of Array.prototype.indexOf() in JavaScript?",
            type: "mcq",
            options: ["A. O(1)", "B. O(n)", "C. O(log n)", "D. O(n²)"],
            correct_answer: "B",
            explanation: "indexOf() searches through the array linearly, making it O(n) time complexity.",
            points: 10,
            time_minutes: 2
          },
          {
            question: "Which method is used to prevent event bubbling in JavaScript?",
            type: "mcq",
            options: ["A. stopPropagation()", "B. preventDefault()", "C. stopImmediatePropagation()", "D. cancelBubble()"],
            correct_answer: "A", 
            explanation: "stopPropagation() prevents the event from bubbling up the DOM tree.",
            points: 10,
            time_minutes: 2
          }
        ];
      }
      
      console.log('✅ Created fallback questions:', generatedAssessment.questions.length);
    }

    // Save the generated assessment to database
    console.log('💾 Saving to database...');
    
    let savedAssessment: any;
    let dbRetries = 0;
    const maxDbRetries = 3;

    while (dbRetries < maxDbRetries) {
      try {
        const { data, error } = await supabase
          .from('skill_assessment')
          .insert({
            interview_id: interviewId,
            title: generatedAssessment.title,
            description: generatedAssessment.description,
            assessment_type: assessmentType,
            difficulty_level: difficulty,
            time_limit: generatedAssessment.total_time_minutes,
            passing_score: generatedAssessment.passing_score,
            instructions: generatedAssessment.instructions,
            evaluation_criteria: generatedAssessment.evaluation_criteria,
            is_active: true
          })
          .select()
          .single();

        if (error) {
          throw error;
        }
        savedAssessment = data;
        break; // Success, exit retry loop
      } catch (error: any) {
        dbRetries++;
        if (dbRetries < maxDbRetries) {
          console.log(`⏳ Database save failed, retrying in ${2 ** dbRetries} seconds... (attempt ${dbRetries}/${maxDbRetries})`);
          await new Promise(resolve => setTimeout(resolve, 2000 * dbRetries)); // Exponential backoff
        } else {
          throw error;
        }
      }
    }

    console.log('✅ Assessment saved successfully:', savedAssessment.id);

    // Create coding challenges if it's a coding assessment
    if (assessmentType === 'coding' && generatedAssessment.questions) {
      console.log('🔧 Creating coding challenges...');
      const challenges = generatedAssessment.questions
        .filter((q: any) => q.type === 'coding')
        .map((q: any, index: number) => ({
          skill_assessment_id: savedAssessment.id,
          title: q.question,
          description: q.expected_answer,
          starter_code: q.starter_code || '',
          solution_code: q.solution_code || '',
          test_cases: q.test_cases || [],
          language: 'javascript',
          difficulty_level: difficulty,
          points: q.points || 100,
          order_index: index
        }));

      console.log('📝 Challenges to create:', challenges.length);
      if (challenges.length > 0) {
        console.log('💾 Saving coding challenges...');
        const { error: challengeError } = await supabase
          .from('coding_challenge')
          .insert(challenges);
        
        if (challengeError) {
          console.error('❌ Error saving challenges:', challengeError);
        } else {
          console.log('✅ Coding challenges saved successfully');
        }
      } else {
        console.log('⚠️ No coding challenges found in questions');
      }
    } else {
      console.log('ℹ️ Not a coding assessment or no questions generated');
    }

    return NextResponse.json({
      success: true,
      assessment: savedAssessment,
      generated: generatedAssessment
    });

  } catch (error) {
    console.error('Error generating assessment:', error);
    return NextResponse.json(
      { error: 'Failed to generate assessment' },
      { status: 500 }
    );
  }
}
