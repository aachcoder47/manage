import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Mistral } from "@mistralai/mistralai";
import { CandidateStatus, CandidateProfile } from "@/types/skill-assessment";
import { Response } from "@/types/response";
import { CandidateFilteringService } from "./candidate-filtering.service";
import { ATSIntegrationService } from "./ats.service";

const supabase = createClientComponentClient();

export interface StatusTransition {
  from_status: CandidateStatus;
  to_status: CandidateStatus;
  requires_approval: boolean;
  auto_transition_conditions?: string[];
  notification_settings?: {
    notify_candidate: boolean;
    notify_hiring_manager: boolean;
    message_template?: string;
  };
}

export interface StatusChangeRequest {
  response_id: number;
  new_status: CandidateStatus;
  reason?: string;
  requested_by: string;
  requires_approval?: boolean;
}

export interface StatusChangeApproval {
  id: string;
  status_change_request_id: string;
  approved_by: string;
  approved_at: Date;
  comments?: string;
}

export interface StatusWorkflow {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  transitions: StatusTransition[];
  is_active: boolean;
  created_at: Date;
}

export interface CandidateStatusHistory {
  id: string;
  response_id: number;
  from_status: CandidateStatus;
  to_status: CandidateStatus;
  changed_by: string;
  reason?: string;
  changed_at: Date;
  is_automatic: boolean;
}

export interface StatusMetrics {
  total_candidates: number;
  status_distribution: Record<CandidateStatus, number>;
  average_time_in_status: Record<CandidateStatus, number>;
  conversion_rates: {
    [key: string]: Record<CandidateStatus, number>;
  };
  dropoff_points: {
    status: CandidateStatus;
    count: number;
    percentage: number;
  }[];
}

export class CandidateStatusService {
  private static mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

  // Default status transitions
  private static defaultTransitions: StatusTransition[] = [
    {
      from_status: CandidateStatus.PENDING,
      to_status: CandidateStatus.IN_REVIEW,
      requires_approval: false,
      auto_transition_conditions: ['assessment_completed'],
      notification_settings: {
        notify_candidate: false,
        notify_hiring_manager: true
      }
    },
    {
      from_status: CandidateStatus.IN_REVIEW,
      to_status: CandidateStatus.SELECTED,
      requires_approval: true,
      notification_settings: {
        notify_candidate: true,
        notify_hiring_manager: true,
        message_template: 'Congratulations! You have been selected for the next round.'
      }
    },
    {
      from_status: CandidateStatus.IN_REVIEW,
      to_status: CandidateStatus.REJECTED,
      requires_approval: true,
      notification_settings: {
        notify_candidate: true,
        notify_hiring_manager: true,
        message_template: 'Thank you for your interest. We have decided to move forward with other candidates.'
      }
    },
    {
      from_status: CandidateStatus.IN_REVIEW,
      to_status: CandidateStatus.ON_HOLD,
      requires_approval: false,
      notification_settings: {
        notify_candidate: true,
        notify_hiring_manager: false,
        message_template: 'Your application is currently on hold. We will contact you soon.'
      }
    },
    {
      from_status: CandidateStatus.ON_HOLD,
      to_status: CandidateStatus.IN_REVIEW,
      requires_approval: false,
      notification_settings: {
        notify_candidate: true,
        notify_hiring_manager: true
      }
    },
    {
      from_status: CandidateStatus.SELECTED,
      to_status: CandidateStatus.WITHDRAWN,
      requires_approval: false,
      notification_settings: {
        notify_candidate: false,
        notify_hiring_manager: true
      }
    },
    {
      from_status: CandidateStatus.REJECTED,
      to_status: CandidateStatus.WITHDRAWN,
      requires_approval: false,
      notification_settings: {
        notify_candidate: false,
        notify_hiring_manager: false
      }
    }
  ];

  static async updateCandidateStatus(
    responseId: number,
    newStatus: CandidateStatus,
    reason?: string,
    requestedBy: string = 'system'
  ): Promise<{ success: boolean; message?: string; requires_approval?: boolean }> {
    try {
      // Get current status
      const { data: currentResponse } = await supabase
        .from("response")
        .select("candidate_status")
        .eq("id", responseId)
        .single();

      if (!currentResponse) {
        return { success: false, message: "Candidate not found" };
      }

      const currentStatus = currentResponse.candidate_status as CandidateStatus;

      // Check if transition is valid
      const transition = this.validateStatusTransition(currentStatus, newStatus);
      if (!transition) {
        return { 
          success: false, 
          message: `Invalid status transition from ${currentStatus} to ${newStatus}` 
        };
      }

      // Check if approval is required
      if (transition.requires_approval) {
        const requestId = await this.createStatusChangeRequest({
          response_id: responseId,
          new_status: newStatus,
          reason: reason,
          requested_by: requestedBy
        });

        return {
          success: true,
          message: "Status change requires approval",
          requires_approval: true
        };
      }

      // Execute status change
      await this.executeStatusChange(responseId, currentStatus, newStatus, reason, requestedBy, false);

      return { success: true, message: "Status updated successfully" };
    } catch (error) {
      console.error("Error updating candidate status:", error);
      return { success: false, message: "Internal server error" };
    }
  }

  static async approveStatusChange(
    requestId: string,
    approvedBy: string,
    comments?: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Get the status change request
      const { data: request } = await supabase
        .from("status_change_request")
        .select("*")
        .eq("id", requestId)
        .eq("requires_approval", true)
        .single();

      if (!request) {
        return { success: false, message: "Approval request not found" };
      }

      // Get current status
      const { data: currentResponse } = await supabase
        .from("response")
        .select("candidate_status")
        .eq("id", request.response_id)
        .single();

      if (!currentResponse) {
        return { success: false, message: "Candidate not found" };
      }

      // Execute status change
      await this.executeStatusChange(
        request.response_id,
        currentResponse.candidate_status as CandidateStatus,
        request.new_status,
        request.reason,
        approvedBy,
        false
      );

      // Update request status
      await supabase
        .from("status_change_request")
        .update({ status: 'approved' })
        .eq("id", requestId);

      // Log approval
      await supabase
        .from("status_change_approval")
        .insert({
          status_change_request_id: requestId,
          approved_by: approvedBy,
          approved_at: new Date().toISOString(),
          comments: comments
        });

      return { success: true, message: "Status change approved and executed" };
    } catch (error) {
      console.error("Error approving status change:", error);
      return { success: false, message: "Internal server error" };
    }
  }

  static async rejectStatusChange(
    requestId: string,
    rejectedBy: string,
    reason?: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      await supabase
        .from("status_change_request")
        .update({ 
          status: 'rejected',
          rejection_reason: reason,
          rejected_by: rejectedBy,
          rejected_at: new Date().toISOString()
        })
        .eq("id", requestId);

      return { success: true, message: "Status change rejected" };
    } catch (error) {
      console.error("Error rejecting status change:", error);
      return { success: false, message: "Internal server error" };
    }
  }

  private static async executeStatusChange(
    responseId: number,
    fromStatus: CandidateStatus,
    toStatus: CandidateStatus,
    reason?: string,
    changedBy: string = 'system',
    isAutomatic: boolean = false
  ): Promise<void> {
    // Update the response
    const { error } = await supabase
      .from("response")
      .update({ 
        candidate_status: toStatus,
        is_viewed: true 
      })
      .eq("id", responseId);

    if (error) throw error;

    // Log the status change
    await this.logStatusChange(responseId, fromStatus, toStatus, changedBy, reason, isAutomatic);

    // Send notifications
    await this.sendStatusChangeNotifications(responseId, fromStatus, toStatus);

    // Sync to ATS
    await this.syncStatusChangeToATS(responseId, toStatus);
  }

  private static validateStatusTransition(
    fromStatus: CandidateStatus,
    toStatus: CandidateStatus
  ): StatusTransition | null {
    return this.defaultTransitions.find(
      transition => transition.from_status === fromStatus && transition.to_status === toStatus
    ) || null;
  }

  private static async createStatusChangeRequest(
    request: Omit<StatusChangeRequest, 'requires_approval'>
  ): Promise<string> {
    const { data, error } = await supabase
      .from("status_change_request")
      .insert({
        ...request,
        requires_approval: true,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select("id")
      .single();

    if (error) throw error;
    return data.id;
  }

  private static async logStatusChange(
    responseId: number,
    fromStatus: CandidateStatus,
    toStatus: CandidateStatus,
    changedBy: string,
    reason?: string,
    isAutomatic: boolean = false
  ): Promise<void> {
    try {
      await supabase
        .from("candidate_status_history")
        .insert({
          response_id: responseId,
          from_status: fromStatus,
          to_status: toStatus,
          changed_by: changedBy,
          reason: reason,
          changed_at: new Date().toISOString(),
          is_automatic: isAutomatic
        });
    } catch (error) {
      console.error("Error logging status change:", error);
    }
  }

  private static async sendStatusChangeNotifications(
    responseId: number,
    fromStatus: CandidateStatus,
    toStatus: CandidateStatus
  ): Promise<void> {
    try {
      const transition = this.validateStatusTransition(fromStatus, toStatus);
      if (!transition?.notification_settings) return;

      // Get candidate and response details
      const { data: response } = await supabase
        .from("response")
        .select(`
          *,
          interview:interview_id(
            name,
            organization_id,
            user_id
          )
        `)
        .eq("id", responseId)
        .single();

      if (!response) return;

      // Send candidate notification if required
      if (transition.notification_settings.notify_candidate && response.email) {
        await this.sendCandidateNotification(
          response.email,
          toStatus,
          transition.notification_settings.message_template,
          response.interview?.name
        );
      }

      // Send hiring manager notification if required
      if (transition.notification_settings.notify_hiring_manager) {
        await this.sendHiringManagerNotification(
          response.interview?.user_id,
          responseId,
          fromStatus,
          toStatus
        );
      }
    } catch (error) {
      console.error("Error sending status change notifications:", error);
    }
  }

  private static async sendCandidateNotification(
    email: string,
    status: CandidateStatus,
    template?: string,
    interviewName?: string
  ): Promise<void> {
    // Implement email sending logic here
    console.log(`Sending notification to ${email} for status: ${status}`);
    console.log(`Interview: ${interviewName}`);
    console.log(`Message: ${template || 'Your application status has been updated.'}`);
  }

  private static async sendHiringManagerNotification(
    userId: string,
    responseId: number,
    fromStatus: CandidateStatus,
    toStatus: CandidateStatus
  ): Promise<void> {
    // Implement notification logic for hiring managers
    console.log(`Notifying hiring manager ${userId} about status change for response ${responseId}`);
    console.log(`Status changed from ${fromStatus} to ${toStatus}`);
  }

  private static async syncStatusChangeToATS(
    responseId: number,
    status: CandidateStatus
  ): Promise<void> {
    try {
      // Get ATS integrations
      const { data: integrations } = await supabase
        .from("ats_integration")
        .select("*")
        .eq("is_active", true);

      if (!integrations || integrations.length === 0) return;

      // Get existing ATS mappings
      const { data: syncLogs } = await supabase
        .from("ats_sync_log")
        .select("*")
        .eq("response_id", responseId)
        .eq("sync_type", 'candidate_create')
        .eq("status", 'success');

      if (!syncLogs || syncLogs.length === 0) return;

      // Update status in each ATS
      for (const integration of integrations) {
        const syncLog = syncLogs.find(log => log.ats_integration_id === integration.id);
        if (syncLog) {
          await ATSIntegrationService.updateCandidateStatusInATS(
            integration.id,
            syncLog.response_data?.id,
            status,
            responseId
          );
        }
      }
    } catch (error) {
      console.error("Error syncing status change to ATS:", error);
    }
  }

  static async getStatusHistory(responseId: number): Promise<CandidateStatusHistory[]> {
    try {
      const { data, error } = await supabase
        .from("candidate_status_history")
        .select("*")
        .eq("response_id", responseId)
        .order("changed_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching status history:", error);
      return [];
    }
  }

  static async getPendingStatusChanges(organizationId?: string): Promise<StatusChangeRequest[]> {
    try {
      let query = supabase
        .from("status_change_request")
        .select(`
          *,
          response:response_id(
            name,
            email,
            interview:interview_id(
              name,
              organization_id
            )
          )
        `)
        .eq("status", "pending")
        .eq("requires_approval", true);

      if (organizationId) {
        query = query.eq("response.interview.organization_id", organizationId);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching pending status changes:", error);
      return [];
    }
  }

  static async getStatusMetrics(interviewId?: string): Promise<StatusMetrics> {
    try {
      let query = supabase.from("response").select("candidate_status, created_at");
      
      if (interviewId) {
        query = query.eq("interview_id", interviewId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const responses = data || [];
      const totalCandidates = responses.length;

      // Status distribution
      const statusDistribution: Record<string, number> = {};
      responses.forEach(response => {
        statusDistribution[response.candidate_status] = 
          (statusDistribution[response.candidate_status] || 0) + 1;
      });

      // Average time in status (simplified calculation)
      const averageTimeInStatus: Record<string, number> = {};
      Object.keys(statusDistribution).forEach(status => {
        averageTimeInStatus[status] = Math.random() * 10 + 1; // Placeholder
      });

      // Conversion rates
      const conversionRates: any = {};
      // This would require more complex analysis of status transitions

      // Dropoff points
      const dropoffPoints = Object.entries(statusDistribution)
        .filter(([_, count]) => count > 0)
        .map(([status, count]) => ({
          status: status as CandidateStatus,
          count,
          percentage: (count / totalCandidates) * 100
        }));

      return {
        total_candidates: totalCandidates,
        status_distribution: statusDistribution as Record<CandidateStatus, number>,
        average_time_in_status: averageTimeInStatus as Record<CandidateStatus, number>,
        conversion_rates: conversionRates,
        dropoff_points: dropoffPoints
      };
    } catch (error) {
      console.error("Error calculating status metrics:", error);
      return {
        total_candidates: 0,
        status_distribution: {} as Record<CandidateStatus, number>,
        average_time_in_status: {} as Record<CandidateStatus, number>,
        conversion_rates: {},
        dropoff_points: []
      };
    }
  }

  static async autoUpdateCandidateStatuses(): Promise<void> {
    try {
      // Find candidates who should be automatically transitioned
      const { data: candidates } = await supabase
        .from("response")
        .select(`
          id,
          candidate_status,
          created_at,
          is_analysed,
          analytics,
          candidate_profile:candidate_profile_id(
            experience_years,
            skills
          )
        `)
        .in("candidate_status", [CandidateStatus.PENDING]);

      if (!candidates) return;

      for (const candidate of candidates) {
        const shouldTransition = await this.evaluateAutoTransitionConditions(candidate);
        if (shouldTransition) {
          await this.executeStatusChange(
            candidate.id,
            CandidateStatus.PENDING,
            CandidateStatus.IN_REVIEW,
            "Automatic transition: Assessment completed",
            'system',
            true
          );
        }
      }
    } catch (error) {
      console.error("Error in auto status update:", error);
    }
  }

  private static async evaluateAutoTransitionConditions(candidate: any): Promise<boolean> {
    // Check if assessment is completed and analyzed
    return candidate.is_analysed && candidate.analytics;
  }

  static async getRecommendedStatus(
    responseId: number
  ): Promise<{ recommended_status: CandidateStatus; confidence: number; reasoning: string }> {
    try {
      // Get candidate data
      const { data: response } = await supabase
        .from("response")
        .select(`
          *,
          candidate_profile:candidate_profile_id(*),
          candidate_assessments:candidate_assessments(
            score,
            max_score,
            passed,
            skill_assessment:skill_assessment_id(
              assessment_type,
              difficulty_level
            )
          )
        `)
        .eq("id", responseId)
        .single();

      if (!response) {
        return {
          recommended_status: CandidateStatus.PENDING,
          confidence: 0,
          reasoning: "Candidate not found"
        };
      }

      // Use AI to recommend status
      const prompt = this.generateStatusRecommendationPrompt(response);
      
      const completion = await this.mistral.chat.complete({
        model: "mistral-large-latest",
        messages: [
          {
            role: "system",
            content: "You are an expert hiring manager. Analyze candidate data and recommend the most appropriate status with confidence and reasoning."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        responseFormat: { type: "json_object" }
      });

      const recommendation = JSON.parse(completion.choices[0]?.message?.content as string || "{}");
      
      return {
        recommended_status: recommendation.recommended_status || CandidateStatus.PENDING,
        confidence: recommendation.confidence || 0,
        reasoning: recommendation.reasoning || "Unable to generate recommendation"
      };
    } catch (error) {
      console.error("Error getting status recommendation:", error);
      return {
        recommended_status: CandidateStatus.PENDING,
        confidence: 0,
        reasoning: "Error generating recommendation"
      };
    }
  }

  private static generateStatusRecommendationPrompt(response: any): string {
    return `Analyze this candidate and recommend the most appropriate status:

Candidate Data:
- Name: ${response.name || 'Unknown'}
- Email: ${response.email}
- Current Status: ${response.candidate_status}
- Duration: ${response.duration} seconds
- Tab switches: ${response.tab_switch_count}
- Overall Score: ${this.calculateOverallScore(response.candidate_assessments || [])}

Assessment Results:
${JSON.stringify(response.candidate_assessments || [], null, 2)}

Analytics:
${JSON.stringify(response.analytics || {})}

Profile:
${JSON.stringify(response.candidate_profile || {}, null, 2)}

Please recommend one of these statuses: pending, in_review, selected, rejected, on_hold, withdrawn

Respond in this JSON format:
{
  "recommended_status": "status",
  "confidence": number (0-100),
  "reasoning": "detailed explanation for the recommendation"
}

Consider:
1. Assessment performance and scores
2. Communication skills and engagement
3. Technical competency
4. Overall fit for the role
5. Any red flags or concerns`;
  }

  private static calculateOverallScore(assessments: any[]): number {
    if (assessments.length === 0) return 0;

    const totalScore = assessments.reduce((sum, assessment) => {
      const score = assessment.score || 0;
      const maxScore = assessment.max_score || 100;
      return sum + (maxScore > 0 ? (score / maxScore) * 100 : 0);
    }, 0);

    return Math.round(totalScore / assessments.length);
  }
}
