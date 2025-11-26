import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Mistral } from "@mistralai/mistralai";
import { 
  SkillAssessment, 
  CodingChallenge, 
  CandidateAssessment, 
  EvaluationDetails,
  TestResult,
  AssessmentResult,
  DifficultyLevel,
  AssessmentType 
} from "@/types/skill-assessment";

const supabase = createClientComponentClient();

export class SkillAssessmentService {
  // Skill Assessment CRUD
  static async createSkillAssessment(payload: Omit<SkillAssessment, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from("skill_assessment")
        .insert({ ...payload })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating skill assessment:", error);
      throw error;
    }
  }

  static async getSkillAssessmentsByInterview(interviewId: string) {
    try {
      const { data, error } = await supabase
        .from("skill_assessment")
        .select("*")
        .eq("interview_id", interviewId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching skill assessments:", error);
      return [];
    }
  }

  static async updateSkillAssessment(id: string, payload: Partial<SkillAssessment>) {
    try {
      const { data, error } = await supabase
        .from("skill_assessment")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating skill assessment:", error);
      throw error;
    }
  }

  static async deleteSkillAssessment(id: string) {
    try {
      // First, delete related coding challenges
      const { error: challengeError } = await supabase
        .from("coding_challenge")
        .delete()
        .eq("skill_assessment_id", id);

      if (challengeError) {
        console.error("Error deleting coding challenges:", challengeError);
        // Continue with assessment deletion even if challenges fail
      }

      // Then delete the assessment
      const { error } = await supabase
        .from("skill_assessment")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting skill assessment:", error);
      throw error;
    }
  }

  // Coding Challenge CRUD
  static async createCodingChallenge(payload: Omit<CodingChallenge, 'id'>) {
    try {
      const { data, error } = await supabase
        .from("coding_challenge")
        .insert({ ...payload })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating coding challenge:", error);
      throw error;
    }
  }

  static async getCodingChallengesByAssessment(skillAssessmentId: string) {
    try {
      const { data, error } = await supabase
        .from("coding_challenge")
        .select("*")
        .eq("skill_assessment_id", skillAssessmentId)
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching coding challenges:", error);
      return [];
    }
  }

  // Candidate Assessment
  static async createCandidateAssessment(payload: Omit<CandidateAssessment, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from("candidate_assessment")
        .insert({ ...payload })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating candidate assessment:", error);
      throw error;
    }
  }

  static async updateCandidateAssessment(id: string, payload: Partial<CandidateAssessment>) {
    try {
      const { data, error } = await supabase
        .from("candidate_assessment")
        .update({ ...payload })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating candidate assessment:", error);
      throw error;
    }
  }

  static async getCandidateAssessmentsByResponse(responseId: number) {
    try {
      const { data, error } = await supabase
        .from("candidate_assessment")
        .select(`
          *,
          skill_assessment:skill_assessment_id(id, title, description, assessment_type, difficulty_level, time_limit, passing_score)
        `)
        .eq("response_id", responseId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching candidate assessments:", error);
      return [];
    }
  }
}

export class CodeEvaluationService {
  private static mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

  static async evaluateCodeSubmission(
    code: string,
    language: string,
    challenge: CodingChallenge,
    submissionData: Record<string, any>
  ): Promise<EvaluationDetails> {
    try {
      const prompt = this.generateCodeEvaluationPrompt(code, language, challenge, submissionData);
      
      const completion = await this.mistral.chat.complete({
        model: "mistral-large-latest",
        messages: [
          {
            role: "system",
            content: `You are an expert software engineer and technical interviewer. Evaluate code submissions with precision, considering correctness, efficiency, code quality, and best practices. Provide detailed, constructive feedback.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        responseFormat: { type: "json_object" }
      });

      const content = completion.choices[0]?.message?.content;
      const evaluation = JSON.parse(typeof content === 'string' ? content : "{}");
      
      // Run test cases
      const testResults = await this.runTestCases(code, language, challenge.test_cases);
      
      return {
        code_quality: evaluation.code_quality || 0,
        correctness: evaluation.correctness || 0,
        efficiency: evaluation.efficiency || 0,
        best_practices: evaluation.best_practices || 0,
        feedback: evaluation.feedback || "",
        strengths: evaluation.strengths || [],
        improvements: evaluation.improvements || [],
        test_results: testResults
      };
    } catch (error) {
      console.error("Error evaluating code submission:", error);
      throw error;
    }
  }

  private static generateCodeEvaluationPrompt(
    code: string,
    language: string,
    challenge: CodingChallenge,
    submissionData: Record<string, any>
  ): string {
    return `Evaluate this ${language} code submission for the following challenge:

Challenge: ${challenge.title}
Description: ${challenge.description}
Difficulty: ${challenge.difficulty_level}

Code Submission:
\`\`\`${language}
${code}
\`\`\`

Test Cases:
${JSON.stringify(challenge.test_cases, null, 2)}

Please evaluate the code based on:
1. Correctness (0-100): Does the code solve the problem correctly?
2. Efficiency (0-100): How optimized is the solution? Time and space complexity?
3. Code Quality (0-100): Readability, maintainability, structure
4. Best Practices (0-100): Following language conventions, error handling, etc.

Provide:
- Overall feedback summary
- Specific strengths (what was done well)
- Areas for improvement
- Detailed score breakdown

Respond in this JSON format:
{
  "code_quality": number,
  "correctness": number,
  "efficiency": number,
  "best_practices": number,
  "feedback": "string",
  "strengths": ["string"],
  "improvements": ["string"]
}`;
  }

  private static async runTestCases(
    code: string,
    language: string,
    testCases: any[]
  ): Promise<TestResult[]> {
    // This is a simplified version - in production, you'd use a sandboxed environment
    // For now, we'll simulate test execution
    const results: TestResult[] = [];

    for (const testCase of testCases) {
      try {
        // Simulate test execution
        const result = await this.simulateCodeExecution(code, language, testCase.input);
        
        results.push({
          test_case: testCase,
          passed: this.compareOutputs(result.output, testCase.expected_output),
          actual_output: result.output,
          execution_time: result.executionTime,
          error_message: result.error
        });
      } catch (error) {
        results.push({
          test_case: testCase,
          passed: false,
          error_message: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    return results;
  }

  private static async simulateCodeExecution(
    code: string,
    language: string,
    input: any
  ): Promise<{ output: any; executionTime: number; error?: string }> {
    // Simplified simulation - in production, use Docker containers or similar
    // This is where you'd integrate with actual code execution services
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate execution
        resolve({
          output: "simulated_output", // This would be the actual code output
          executionTime: Math.floor(Math.random() * 1000) // Random execution time
        });
      }, 100);
    });
  }

  private static compareOutputs(actual: any, expected: any): boolean {
    // Simple comparison - in production, this would be more sophisticated
    return JSON.stringify(actual) === JSON.stringify(expected);
  }

  static async generateOverallAssessmentResult(
    candidateAssessments: CandidateAssessment[]
  ): Promise<AssessmentResult> {
    const totalScore = candidateAssessments.reduce((sum, assessment) => sum + (assessment.score || 0), 0);
    const maxScore = candidateAssessments.reduce((sum, assessment) => sum + (assessment.max_score || 0), 0);
    const overallScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const passed = candidateAssessments.every(assessment => assessment.passed);

    // Generate AI feedback
    const feedback = await this.generateAssessmentFeedback(candidateAssessments);

    return {
      candidate_assessment_id: candidateAssessments[0]?.id || "",
      overall_score: Math.round(overallScore),
      max_score: maxScore,
      passed,
      detailed_feedback: feedback.detailed_feedback,
      recommendations: feedback.recommendations,
      skill_scores: feedback.skill_scores
    };
  }

  private static async generateAssessmentFeedback(
    candidateAssessments: CandidateAssessment[]
  ): Promise<{
    detailed_feedback: string;
    recommendations: string[];
    skill_scores: Record<string, number>;
  }> {
    try {
      const prompt = `Generate comprehensive feedback for a candidate who completed ${candidateAssessments.length} assessments:

Assessment Results:
${JSON.stringify(candidateAssessments.map(a => ({
  score: a.score,
  max_score: a.max_score,
  passed: a.passed,
  evaluation: a.evaluation_details
})), null, 2)}

Please provide:
1. Detailed overall feedback
2. Specific recommendations for improvement
3. Skill area scores (problem_solving, code_quality, technical_knowledge, communication)

Respond in JSON format:
{
  "detailed_feedback": "string",
  "recommendations": ["string"],
  "skill_scores": {
    "problem_solving": number,
    "code_quality": number,
    "technical_knowledge": number,
    "communication": number
  }
}`;

      const completion = await this.mistral.chat.complete({
        model: "mistral-large-latest",
        messages: [
          {
            role: "system",
            content: "You are an expert technical interviewer providing constructive feedback to candidates."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        responseFormat: { type: "json_object" }
      });

      const content = completion.choices[0]?.message?.content;
      return JSON.parse(typeof content === 'string' ? content : "{}");
    } catch (error) {
      console.error("Error generating assessment feedback:", error);
      return {
        detailed_feedback: "Unable to generate feedback at this time.",
        recommendations: [],
        skill_scores: {}
      };
    }
  }
}
