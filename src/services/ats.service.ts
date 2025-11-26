"use server";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ATSIntegration, ATSSyncLog, ATSProvider, CandidateProfile, Response } from "@/types/skill-assessment";
import axios from "axios";

const supabase = createClientComponentClient();

export interface ATSProviderConfig {
  greenhouse?: {
    board_token: string;
    api_key: string;
  };
  lever?: {
    client_id: string;
    client_secret: string;
  };
  workday?: {
    tenant_name: string;
    client_id: string;
    client_secret: string;
  };
}

export abstract class BaseATSProvider {
  protected config: any;
  protected organizationId: string;

  constructor(config: any, organizationId: string) {
    this.config = config;
    this.organizationId = organizationId;
  }

  abstract createCandidate(candidateData: CandidateProfile): Promise<ATSResponse>;
  abstract updateCandidateStatus(candidateId: string, status: string): Promise<ATSResponse>;
  abstract syncAssessmentResults(candidateId: string, assessmentData: any): Promise<ATSResponse>;
  abstract validateConnection(): Promise<boolean>;
}

export interface ATSResponse {
  success: boolean;
  data?: any;
  error?: string;
  providerCandidateId?: string;
}

export class GreenhouseProvider extends BaseATSProvider {
  private baseURL = "https://harvest.greenhouse.io/v1";

  async createCandidate(candidateData: CandidateProfile): Promise<ATSResponse> {
    try {
      const greenhouseCandidate = this.mapToGreenhouseFormat(candidateData);
      
      const response = await axios.post(
        `${this.baseURL}/candidates`,
        greenhouseCandidate,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(this.config.api_key + ':').toString('base64')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        providerCandidateId: response.data.id.toString()
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async updateCandidateStatus(candidateId: string, status: string): Promise<ATSResponse> {
    try {
      const greenhouseStatus = this.mapStatusToGreenhouse(status);
      
      const response = await axios.post(
        `${this.baseURL}/candidates/${candidateId}/applications`,
        {
          job_id: this.config.default_job_id,
          status: greenhouseStatus
        },
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(this.config.api_key + ':').toString('base64')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async syncAssessmentResults(candidateId: string, assessmentData: any): Promise<ATSResponse> {
    try {
      // Add assessment results as notes or custom fields
      const note = {
        user_id: this.config.default_user_id,
        body: `AI Assessment Results:\n${JSON.stringify(assessmentData, null, 2)}`
      };

      const response = await axios.post(
        `${this.baseURL}/candidates/${candidateId}/notes`,
        note,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(this.config.api_key + ':').toString('base64')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async validateConnection(): Promise<boolean> {
    try {
      const response = await axios.get(
        `${this.baseURL}/users`,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(this.config.api_key + ':').toString('base64')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.status === 200;
    } catch {
      return false;
    }
  }

  private mapToGreenhouseFormat(candidate: CandidateProfile) {
    return {
      first_name: candidate.ai_generated_summary?.split(' ')[0] || 'Unknown',
      last_name: candidate.ai_generated_summary?.split(' ')[1] || 'Candidate',
      email: candidate.resume_url ? 'email@example.com' : 'no-email@example.com',
      phone: candidate.phone,
      address: {
        address1: candidate.location || '',
        city: '',
        state: '',
        zip: '',
        country: ''
      },
      company: candidate.work_experience?.[0]?.company,
      title: candidate.work_experience?.[0]?.position,
      education: candidate.education?.map(edu => ({
        school_name: edu.institution,
        degree: edu.degree,
        discipline: edu.field,
        start_date: edu.start_date,
        end_date: edu.end_date
      })),
      tags: candidate.skills,
      applications: [
        {
          job_id: this.config.default_job_id,
          status: 'active'
        }
      ]
    };
  }

  private mapStatusToGreenhouse(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'active',
      'in_review': 'review',
      'selected': 'hired',
      'rejected': 'rejected',
      'on_hold': 'on_hold',
      'withdrawn': 'withdrawn'
    };
    return statusMap[status] || 'active';
  }
}

export class LeverProvider extends BaseATSProvider {
  private baseURL = "https://api.lever.co/v1";

  async createCandidate(candidateData: CandidateProfile): Promise<ATSResponse> {
    try {
      const leverCandidate = this.mapToLeverFormat(candidateData);
      
      const response = await axios.post(
        `${this.baseURL}/candidates`,
        leverCandidate,
        {
          headers: {
            'Authorization': `Bearer ${this.config.api_key}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        providerCandidateId: response.data.id
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async updateCandidateStatus(candidateId: string, status: string): Promise<ATSResponse> {
    try {
      const leverStage = this.mapStatusToLever(status);
      
      const response = await axios.post(
        `${this.baseURL}/candidates/${candidateId}/stage`,
        { stage: leverStage },
        {
          headers: {
            'Authorization': `Bearer ${this.config.api_key}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async syncAssessmentResults(candidateId: string, assessmentData: any): Promise<ATSResponse> {
    try {
      const note = {
        text: `AI Assessment Results:\n${JSON.stringify(assessmentData, null, 2)}`,
        value: 0
      };

      const response = await axios.post(
        `${this.baseURL}/candidates/${candidateId}/offers/notes`,
        note,
        {
          headers: {
            'Authorization': `Bearer ${this.config.api_key}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async validateConnection(): Promise<boolean> {
    try {
      const response = await axios.get(
        `${this.baseURL}/users`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.api_key}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.status === 200;
    } catch {
      return false;
    }
  }

  private mapToLeverFormat(candidate: CandidateProfile) {
    return {
      name: candidate.ai_generated_summary || 'Unknown Candidate',
      email: candidate.resume_url ? 'email@example.com' : 'no-email@example.com',
      phone: candidate.phone,
      location: candidate.location,
      tags: candidate.skills,
      urls: [
        ...(candidate.linkedin_url ? [{ url: candidate.linkedin_url, type: 'linkedin' }] : []),
        ...(candidate.github_url ? [{ url: candidate.github_url, type: 'github' }] : []),
        ...(candidate.portfolio_url ? [{ url: candidate.portfolio_url, type: 'portfolio' }] : [])
      ],
      resume: candidate.resume_url,
      education: candidate.education?.map(edu => ({
        school: edu.institution,
        degree: edu.degree,
        discipline: edu.field,
        start: edu.start_date,
        end: edu.end_date
      })),
      experience: candidate.work_experience?.map(exp => ({
        company: exp.company,
        title: exp.position,
        start: exp.start_date,
        end: exp.end_date,
        description: exp.description
      }))
    };
  }

  private mapStatusToLever(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'new',
      'in_review': 'screening',
      'selected': 'offer',
      'rejected': 'rejected',
      'on_hold': 'on_hold',
      'withdrawn': 'withdrawn'
    };
    return statusMap[status] || 'new';
  }
}

export class WorkdayProvider extends BaseATSProvider {
  private baseURL = (tenant: string) => `https://services.workday.com/ccx/api/${tenant}/v1`;

  async createCandidate(candidateData: CandidateProfile): Promise<ATSResponse> {
    // Workday integration would require more complex SOAP/REST API calls
    // This is a simplified placeholder
    return {
      success: false,
      error: "Workday integration requires enterprise setup"
    };
  }

  async updateCandidateStatus(candidateId: string, status: string): Promise<ATSResponse> {
    return {
      success: false,
      error: "Workday integration requires enterprise setup"
    };
  }

  async syncAssessmentResults(candidateId: string, assessmentData: any): Promise<ATSResponse> {
    return {
      success: false,
      error: "Workday integration requires enterprise setup"
    };
  }

  async validateConnection(): Promise<boolean> {
    return false;
  }
}

export class ATSIntegrationService {
  static async createATSIntegration(payload: Omit<ATSIntegration, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from("ats_integration")
        .insert({ ...payload })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating ATS integration:", error);
      throw error;
    }
  }

  static async getATSIntegrationsByOrganization(organizationId: string) {
    try {
      const { data, error } = await supabase
        .from("ats_integration")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("is_active", true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching ATS integrations:", error);
      return [];
    }
  }

  static async validateATSConnection(integrationId: string): Promise<boolean> {
    try {
      const integration = await this.getATSIntegrationById(integrationId);
      if (!integration) return false;

      const provider = this.getProviderInstance(integration);
      return await provider.validateConnection();
    } catch (error) {
      console.error("Error validating ATS connection:", error);
      return false;
    }
  }

  static async syncCandidateToATS(
    integrationId: string,
    candidateProfile: CandidateProfile,
    responseId: number
  ): Promise<ATSResponse> {
    try {
      const integration = await this.getATSIntegrationById(integrationId);
      if (!integration) {
        return { success: false, error: "ATS integration not found" };
      }

      const provider = this.getProviderInstance(integration);
      const result = await provider.createCandidate(candidateProfile);

      // Log the sync attempt
      await this.logATSSync({
        ats_integration_id: integrationId,
        response_id: responseId,
        sync_type: 'candidate_create',
        status: result.success ? 'success' : 'failed',
        request_data: candidateProfile,
        response_data: result.data,
        error_message: result.error
      });

      return result;
    } catch (error) {
      console.error("Error syncing candidate to ATS:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  static async updateCandidateStatusInATS(
    integrationId: string,
    providerCandidateId: string,
    status: string,
    responseId: number
  ): Promise<ATSResponse> {
    try {
      const integration = await this.getATSIntegrationById(integrationId);
      if (!integration) {
        return { success: false, error: "ATS integration not found" };
      }

      const provider = this.getProviderInstance(integration);
      const result = await provider.updateCandidateStatus(providerCandidateId, status);

      // Log the sync attempt
      await this.logATSSync({
        ats_integration_id: integrationId,
        response_id: responseId,
        sync_type: 'status_update',
        status: result.success ? 'success' : 'failed',
        request_data: { providerCandidateId, status },
        response_data: result.data,
        error_message: result.error
      });

      return result;
    } catch (error) {
      console.error("Error updating candidate status in ATS:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  static async syncAssessmentResultsToATS(
    integrationId: string,
    providerCandidateId: string,
    assessmentData: any,
    responseId: number
  ): Promise<ATSResponse> {
    try {
      const integration = await this.getATSIntegrationById(integrationId);
      if (!integration) {
        return { success: false, error: "ATS integration not found" };
      }

      const provider = this.getProviderInstance(integration);
      const result = await provider.syncAssessmentResults(providerCandidateId, assessmentData);

      // Log the sync attempt
      await this.logATSSync({
        ats_integration_id: integrationId,
        response_id: responseId,
        sync_type: 'assessment_result',
        status: result.success ? 'success' : 'failed',
        request_data: { providerCandidateId, assessmentData },
        response_data: result.data,
        error_message: result.error
      });

      return result;
    } catch (error) {
      console.error("Error syncing assessment results to ATS:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  private static async getATSIntegrationById(integrationId: string): Promise<ATSIntegration | null> {
    try {
      const { data, error } = await supabase
        .from("ats_integration")
        .select("*")
        .eq("id", integrationId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching ATS integration:", error);
      return null;
    }
  }

  private static getProviderInstance(integration: ATSIntegration): BaseATSProvider {
    switch (integration.provider) {
      case ATSProvider.GREENHOUSE:
        return new GreenhouseProvider(integration.configuration, integration.organization_id);
      case ATSProvider.LEVER:
        return new LeverProvider(integration.configuration, integration.organization_id);
      case ATSProvider.WORKDAY:
        return new WorkdayProvider(integration.configuration, integration.organization_id);
      default:
        throw new Error(`Unsupported ATS provider: ${integration.provider}`);
    }
  }

  private static async logATSSync(logData: Omit<ATSSyncLog, 'id' | 'created_at'>) {
    try {
      const { error } = await supabase
        .from("ats_sync_log")
        .insert(logData);

      if (error) throw error;
    } catch (error) {
      console.error("Error logging ATS sync:", error);
    }
  }

  static async getATSSyncLogs(integrationId?: string, responseId?: number) {
    try {
      let query = supabase
        .from("ats_sync_log")
        .select("*")
        .order("created_at", { ascending: false });

      if (integrationId) {
        query = query.eq("ats_integration_id", integrationId);
      }
      if (responseId) {
        query = query.eq("response_id", responseId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching ATS sync logs:", error);
      return [];
    }
  }
}
