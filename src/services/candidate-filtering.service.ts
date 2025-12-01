import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Mistral } from "@mistralai/mistralai";
import { 
  CandidateProfile, 
  CandidateAssessment, 
  AssessmentResult 
} from "@/types/skill-assessment";
import { AssessmentType, DifficultyLevel, CandidateStatus } from "@/types/skill-assessment";
import { InterviewService } from "./interviews.service";

// Define Response interface locally
interface Response {
  id: number;
  name: string;
  email: string;
  call_id: string;
  candidate_status: string;
  duration: number;
  details: any;
  analytics: any;
  is_analysed: boolean;
  is_ended: boolean;
  is_viewed: boolean;
  tab_switch_count: number;
  created_at: string;
}

const supabase = createClientComponentClient();

export interface FilterCriteria {
  minScore?: number;
  maxScore?: number;
  skills?: string[];
  experienceYears?: {
    min?: number;
    max?: number;
  };
  location?: string[];
  status?: CandidateStatus[];
  assessmentType?: string[];
  difficultyLevel?: string[];
  timeSpent?: {
    min?: number;
    max?: number;
  };
}

export interface CandidateInsight {
  candidate_id: number;
  match_score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  risk_factors: string[];
  potential_role_fit: string[];
}

export interface FilteredCandidatesResult {
  candidates: EnhancedCandidate[];
  total_count: number;
  insights: {
    average_score: number;
    skill_distribution: Record<string, number>;
    status_distribution: Record<string, number>;
    top_performers: EnhancedCandidate[];
    needs_review: EnhancedCandidate[];
  };
}

export interface EnhancedCandidate extends Response {
  candidate_profile?: CandidateProfile;
  candidate_assessments?: CandidateAssessment[];
  overall_score?: number;
  match_score?: number;
  ai_insights?: CandidateInsight;
  ats_sync_status?: {
    synced: boolean;
    provider?: string;
    last_sync?: Date;
  };
}

export class CandidateFilteringService {
  private static mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

  static async filterCandidates(
    interviewId: string,
    criteria: FilterCriteria,
    page: number = 1,
    limit: number = 20
  ): Promise<FilteredCandidatesResult> {
    try {
      // Get all responses for the interview
      const responses = await InterviewService.getAllRespondents(interviewId);
      
      // Enhance with additional data
      const enhancedCandidates = await this.enhanceCandidatesData(responses);
      
      // Apply filters
      const filteredCandidates = this.applyFilters(enhancedCandidates, criteria);
      
      // Sort by match score (highest first)
      filteredCandidates.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
      
      // Paginate
      const startIndex = (page - 1) * limit;
      const paginatedCandidates = filteredCandidates.slice(startIndex, startIndex + limit);
      
      // Generate insights
      const insights = await this.generateBatchCandidateInsights(filteredCandidates);
      
      return {
        candidates: paginatedCandidates,
        total_count: filteredCandidates.length,
        insights
      };
    } catch (error) {
      console.error("Error filtering candidates:", error);
      throw error;
    }
  }

  static async enhanceCandidatesData(respondents: { respondents: any }[]): Promise<EnhancedCandidate[]> {
    const enhancedCandidates: EnhancedCandidate[] = [];
    
    for (const respondent of respondents) {
      try {
        const response = respondent.respondents;
        
        // Get candidate profile
        const { data: profile } = await supabase
          .from("candidate_profile")
          .select("*")
          .eq("response_id", response.id)
          .single();

        // Get candidate assessments
        const { data: assessments } = await supabase
          .from("candidate_assessment")
          .select(`
            *,
            skill_assessment:skill_assessment_id(*)
          `)
          .eq("response_id", response.id);

        // Calculate overall score
        const overallScore = this.calculateOverallScore(assessments || []);

        // Get ATS sync status
        const { data: syncLogs } = await supabase
          .from("ats_sync_log")
          .select("*")
          .eq("response_id", response.id)
          .eq("status", "success")
          .order("created_at", { ascending: false })
          .limit(1);

        // Generate AI insights
        const aiInsights = await this.generateCandidateInsights(response, profile, assessments || []);

        enhancedCandidates.push({
          ...response,
          candidate_profile: profile || undefined,
          candidate_assessments: assessments || undefined,
          overall_score: overallScore,
          match_score: aiInsights.match_score,
          ai_insights: aiInsights,
          ats_sync_status: syncLogs && syncLogs.length > 0 ? {
            synced: true,
            provider: syncLogs[0].ats_integration_id,
            last_sync: new Date(syncLogs[0].created_at)
          } : {
            synced: false
          }
        });
      } catch (error) {
        console.error(`Error enhancing candidate data:`, error);
        enhancedCandidates.push({ ...respondent.respondents });
      }
    }

    return enhancedCandidates;
  }

  private static calculateOverallScore(assessments: CandidateAssessment[]): number {
    if (assessments.length === 0) {
      return 0;
    }

    const totalScore = assessments.reduce((sum, assessment) => {
      const score = assessment.score || 0;
      const maxScore = assessment.max_score || 100;
      return sum + (maxScore > 0 ? (score / maxScore) * 100 : 0);
    }, 0);

    return Math.round(totalScore / assessments.length);
  }

  private static async generateCandidateInsights(
    response: Response,
    profile?: CandidateProfile,
    assessments?: CandidateAssessment[]
  ): Promise<CandidateInsight> {
    try {
      const prompt = this.generateInsightPrompt(response, profile, assessments);
      
      const completion = await this.mistral.chat.complete({
        model: "mistral-large-latest",
        messages: [
          {
            role: "system",
            content: "You are an expert hiring manager analyzing candidate profiles. Provide detailed, actionable insights about candidate fit, strengths, and potential risks."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        responseFormat: { type: "json_object" }
      });

      const insights = JSON.parse(completion.choices[0]?.message?.content as string || "{}");
      
      return {
        candidate_id: response.id,
        match_score: insights.match_score || 0,
        strengths: insights.strengths || [],
        weaknesses: insights.weaknesses || [],
        recommendations: insights.recommendations || [],
        risk_factors: insights.risk_factors || [],
        potential_role_fit: insights.potential_role_fit || []
      };
    } catch (error) {
      console.error("Error generating candidate insights:", error);
      return {
        candidate_id: response.id,
        match_score: 0,
        strengths: [],
        weaknesses: [],
        recommendations: [],
        risk_factors: [],
        potential_role_fit: []
      };
    }
  }

  private static generateInsightPrompt(
    response: Response,
    profile?: CandidateProfile,
    assessments?: CandidateAssessment[]
  ): string {
    return `Analyze this candidate and provide comprehensive insights:

Candidate Information:
- Name: ${response.name || 'Unknown'}
- Email: ${response.email}
- Duration: ${response.duration} seconds
- Tab switches: ${response.tab_switch_count}
- Status: ${response.candidate_status}

${profile ? `
Candidate Profile:
- Experience: ${profile.experience_years || 'Not specified'} years
- Location: ${profile.location || 'Not specified'}
- Skills: ${profile.skills.join(', ') || 'Not specified'}
- Education: ${JSON.stringify(profile.education || [])}
- Work Experience: ${JSON.stringify(profile.work_experience || [])}
- AI Summary: ${profile.ai_generated_summary || 'Not available'}
` : ''}

${assessments && assessments.length > 0 ? `
Assessment Results:
${assessments.map(a => `
- Assessment: ${a.skill_assessment_id}
- Score: ${a.score}/${a.max_score}
- Passed: ${a.passed}
- Time spent: ${a.time_spent} seconds
`).join('\n')}
` : ''}

Interview Analytics:
${JSON.stringify(response.analytics || {})}

Please provide analysis in this JSON format:
{
  "match_score": number (0-100),
  "strengths": ["string"],
  "weaknesses": ["string"], 
  "recommendations": ["string"],
  "risk_factors": ["string"],
  "potential_role_fit": ["string"]
}

Consider:
1. Technical skills and assessment performance
2. Communication skills from interview analytics
3. Experience level and role compatibility
4. Potential red flags or concerns
5. Overall fit for typical tech roles`;
  }

  private static applyFilters(candidates: EnhancedCandidate[], criteria: FilterCriteria): EnhancedCandidate[] {
    return candidates.filter(candidate => {
      // Score filters
      if (criteria.minScore && (candidate.overall_score || 0) < criteria.minScore) {
        return false;
      }
      if (criteria.maxScore && (candidate.overall_score || 0) > criteria.maxScore) {
        return false;
      }
      
      // Status filter
      if (criteria.status && criteria.status.length > 0 && 
          !criteria.status.includes(candidate.candidate_status as CandidateStatus)) {
        return false;
      }
      
      // Skills filter
      if (criteria.skills && criteria.skills.length > 0) {
        const candidateSkills = candidate.candidate_profile?.skills || [];
        const hasRequiredSkills = criteria.skills.some(skill => 
          candidateSkills.some(candidateSkill => 
            candidateSkill.toLowerCase().includes(skill.toLowerCase())
          )
        );
        if (!hasRequiredSkills) {
          return false;
        }
      }
      
      // Experience filter
      if (criteria.experienceYears) {
        const experience = candidate.candidate_profile?.experience_years;
        if (criteria.experienceYears.min && (!experience || experience < criteria.experienceYears.min)) {
          return false;
        }
        if (criteria.experienceYears.max && (!experience || experience > criteria.experienceYears.max)) {
          return false;
        }
      }
      
      // Location filter
      if (criteria.location && criteria.location.length > 0) {
        const candidateLocation = candidate.candidate_profile?.location?.toLowerCase() || '';
        const locationMatch = criteria.location.some(loc => 
          candidateLocation.includes(loc.toLowerCase())
        );
        if (!locationMatch) {
          return false;
        }
      }
      
      // Assessment type filter - temporarily disabled due to data structure limitations
      // This would require fetching skill assessment details separately
      
      // Time spent filter
      if (criteria.timeSpent) {
        const totalTime = candidate.candidate_assessments?.reduce((sum, a) => sum + (a.time_spent || 0), 0) || 0;
        if (criteria.timeSpent.min && totalTime < criteria.timeSpent.min) {
          return false;
        }
        if (criteria.timeSpent.max && totalTime > criteria.timeSpent.max) {
          return false;
        }
      }
      
      return true;
    });
  }

  private static async generateBatchCandidateInsights(candidates: EnhancedCandidate[]) {
    const scores = candidates.map(c => c.overall_score || 0);
    const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;

    // Skill distribution
    const skillCounts: Record<string, number> = {};
    candidates.forEach(candidate => {
      const skills = candidate.candidate_profile?.skills || [];
      skills.forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });

    // Status distribution
    const statusCounts: Record<string, number> = {};
    candidates.forEach(candidate => {
      statusCounts[candidate.candidate_status] = (statusCounts[candidate.candidate_status] || 0) + 1;
    });

    // Top performers (top 10%)
    const topPerformers = candidates
      .filter(c => (c.overall_score || 0) >= 80)
      .sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0))
      .slice(0, 5);

    // Needs review (low scores or concerning factors)
    const needsReview = candidates.filter(c => 
      (c.overall_score || 0) < 60 || 
      (c.tab_switch_count || 0) > 10 ||
      (c.ai_insights?.risk_factors?.length || 0) > 2
    );

    return {
      average_score: Math.round(averageScore),
      skill_distribution: skillCounts,
      status_distribution: statusCounts,
      top_performers: topPerformers,
      needs_review: needsReview
    };
  }

  static async updateCandidateStatus(
    responseId: number,
    newStatus: CandidateStatus,
    reason?: string
  ): Promise<void> {
    try {
      // Update response status
      const { error } = await supabase
        .from("response")
        .update({ 
          candidate_status: newStatus,
          is_viewed: true 
        })
        .eq("id", responseId);

      if (error) {
        throw error;
      }

      // Log status change
      await this.logStatusChange(responseId, newStatus, reason);

      // Sync to ATS if configured
      await this.syncStatusChangeToATS(responseId, newStatus);
    } catch (error) {
      console.error("Error updating candidate status:", error);
      throw error;
    }
  }

  private static async logStatusChange(
    responseId: number,
    status: CandidateStatus,
    reason?: string
  ): Promise<void> {
    try {
      await supabase
        .from("candidate_status_log")
        .insert({
          response_id: responseId,
          old_status: 'previous_status', // Would need to fetch current status first
          new_status: status,
          reason: reason || 'Status updated',
          changed_by: 'system' // Would be user ID in real implementation
        });
    } catch (error) {
      console.error("Error logging status change:", error);
    }
  }

  private static async syncStatusChangeToATS(
    responseId: number,
    status: CandidateStatus
  ): Promise<void> {
    try {
      // Get ATS integrations for the organization
      const { data: integrations } = await supabase
        .from("ats_integration")
        .select("*")
        .eq("is_active", true);

      if (!integrations || integrations.length === 0) {
        return;
      }

      // Get candidate's ATS mapping
      const { data: syncLogs } = await supabase
        .from("ats_sync_log")
        .select("*")
        .eq("response_id", responseId)
        .eq("sync_type", "candidate_create")
        .eq("status", "success");

      if (!syncLogs || syncLogs.length === 0) {
        return;
      }

      // Update status in each ATS
      for (const integration of integrations) {
        const syncLog = syncLogs.find(log => log.ats_integration_id === integration.id);
        if (syncLog) {
          // This would call the ATS service to update status
          // For now, just log the intent
          await supabase
            .from("ats_sync_log")
            .insert({
              ats_integration_id: integration.id,
              response_id: responseId,
              sync_type: 'status_update',
              status: 'pending',
              request_data: { providerCandidateId: syncLog.response_data?.id, status }
            });
        }
      }
    } catch (error) {
      console.error("Error syncing status change to ATS:", error);
    }
  }

  static async getCandidateRecommendations(
    interviewId: string,
    count: number = 5
  ): Promise<EnhancedCandidate[]> {
    try {
      const filterCriteria: FilterCriteria = {
        minScore: 70,
        status: [CandidateStatus.PENDING, CandidateStatus.IN_REVIEW]
      };

      const result = await this.filterCandidates(interviewId, filterCriteria, 1, count);
      return result.candidates;
    } catch (error) {
      console.error("Error getting candidate recommendations:", error);
      return [];
    }
  }

  static async exportCandidatesData(
    interviewId: string,
    format: 'csv' | 'json' | 'excel',
    criteria?: FilterCriteria
  ): Promise<string> {
    try {
      const filterCriteria = criteria || {};
      const result = await this.filterCandidates(interviewId, filterCriteria, 1, 1000);
      
      if (format === 'json') {
        return JSON.stringify(result.candidates, null, 2);
      }
      
      // For CSV and Excel, you'd use a library like xlsx or papaparse
      // This is a simplified CSV implementation
      if (format === 'csv') {
        return this.convertToCSV(result.candidates);
      }
      
      throw new Error("Excel export requires additional implementation");
    } catch (error) {
      console.error("Error exporting candidates data:", error);
      throw error;
    }
  }

  private static convertToCSV(candidates: EnhancedCandidate[]): string {
    const headers = [
      'Name', 'Email', 'Status', 'Overall Score', 'Match Score',
      'Experience Years', 'Location', 'Skills', 'Assessments Completed',
      'Tab Switch Count', 'Duration', 'Created At'
    ];

    const rows = candidates.map(candidate => [
      candidate.name || '',
      candidate.email || '',
      candidate.candidate_status || '',
      candidate.overall_score?.toString() || '',
      candidate.match_score?.toString() || '',
      candidate.candidate_profile?.experience_years?.toString() || '',
      candidate.candidate_profile?.location || '',
      candidate.candidate_profile?.skills?.join('; ') || '',
      candidate.candidate_assessments?.length.toString() || '0',
      candidate.tab_switch_count?.toString() || '0',
      candidate.duration?.toString() || '',
      candidate.created_at?.toString() || ''
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}
