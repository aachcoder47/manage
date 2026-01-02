// services/job-applications.service.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export interface JobApplication {
  id: string;
  created_at: string;
  updated_at: string;
  job_id: string;
  user_id: string;
  organization_id?: string;
  external_posting_id?: string;
  platform: 'linkedin' | 'indeed' | 'naukri' | 'direct';
  platform_application_id?: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  applicant_linkedin?: string;
  resume_url?: string;
  cover_letter?: string;
  application_status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';
  application_source: 'external' | 'direct' | 'internal';
  applied_at: string;
  last_status_change_at: string;
  notes?: string;
  metadata: any;
  is_active: boolean;
}

export interface ApplicationStatusHistory {
  id: string;
  created_at: string;
  application_id: string;
  old_status?: string;
  new_status: string;
  changed_by?: string;
  change_reason?: string;
  notes?: string;
}

export interface ApplicationCommunication {
  id: string;
  created_at: string;
  application_id: string;
  communication_type: 'email' | 'phone' | 'linkedin' | 'sms';
  communication_direction: 'sent' | 'received';
  subject?: string;
  content: string;
  sent_at: string;
  metadata: any;
}

export class JobApplicationsService {
  /**
   * Get all applications for a job
   */
  static async getJobApplications(jobId: string): Promise<JobApplication[]> {
    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .eq('job_id', jobId)
      .eq('is_active', true)
      .order('applied_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch job applications: ${error.message}`);
    }

    return data as JobApplication[];
  }

  /**
   * Get all applications for an organization
   */
  static async getOrganizationApplications(organizationId: string): Promise<JobApplication[]> {
    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('applied_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch organization applications: ${error.message}`);
    }

    return data as JobApplication[];
  }

  /**
   * Create a new job application
   */
  static async createApplication(applicationData: {
    job_id: string;
    user_id: string;
    organization_id?: string;
    external_posting_id?: string;
    platform: 'linkedin' | 'indeed' | 'naukri' | 'direct';
    platform_application_id?: string;
    applicant_name: string;
    applicant_email: string;
    applicant_phone?: string;
    applicant_linkedin?: string;
    resume_url?: string;
    cover_letter?: string;
    application_source?: 'external' | 'direct' | 'internal';
    notes?: string;
    metadata?: any;
  }): Promise<JobApplication> {
    const { data, error } = await supabase
      .from('job_applications')
      .insert({
        job_id: applicationData.job_id,
        user_id: applicationData.user_id,
        organization_id: applicationData.organization_id || null,
        external_posting_id: applicationData.external_posting_id || null,
        platform: applicationData.platform,
        platform_application_id: applicationData.platform_application_id || null,
        applicant_name: applicationData.applicant_name,
        applicant_email: applicationData.applicant_email,
        applicant_phone: applicationData.applicant_phone || null,
        applicant_linkedin: applicationData.applicant_linkedin || null,
        resume_url: applicationData.resume_url || null,
        cover_letter: applicationData.cover_letter || null,
        application_status: 'pending',
        application_source: applicationData.application_source || 'external',
        applied_at: new Date().toISOString(),
        last_status_change_at: new Date().toISOString(),
        notes: applicationData.notes || null,
        metadata: applicationData.metadata || {},
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create job application: ${error.message}`);
    }

    return data as JobApplication;
  }

  /**
   * Update application status
   */
  static async updateApplicationStatus(
    applicationId: string,
    newStatus: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired',
    changedBy?: string,
    changeReason?: string,
    notes?: string
  ): Promise<void> {
    // Get current application
    const { data: currentApp, error: fetchError } = await supabase
      .from('job_applications')
      .select('application_status')
      .eq('id', applicationId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch current application: ${fetchError.message}`);
    }

    const oldStatus = currentApp.application_status;

    // Update application status
    const { error: updateError } = await supabase
      .from('job_applications')
      .update({
        application_status: newStatus,
        last_status_change_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId);

    if (updateError) {
      throw new Error(`Failed to update application status: ${updateError.message}`);
    }

    // Create status history record
    const { error: historyError } = await supabase
      .from('application_status_history')
      .insert({
        application_id: applicationId,
        old_status: oldStatus,
        new_status: newStatus,
        changed_by: changedBy || null,
        change_reason: changeReason || null,
        notes: notes || null,
      });

    if (historyError) {
      console.error('Failed to create status history:', historyError);
    }
  }

  /**
   * Get application status history
   */
  static async getApplicationStatusHistory(applicationId: string): Promise<ApplicationStatusHistory[]> {
    const { data, error } = await supabase
      .from('application_status_history')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch application status history: ${error.message}`);
    }

    return data as ApplicationStatusHistory[];
  }

  /**
   * Add application communication
   */
  static async addApplicationCommunication(
    applicationId: string,
    communicationData: {
      communication_type: 'email' | 'phone' | 'linkedin' | 'sms';
      communication_direction: 'sent' | 'received';
      subject?: string;
      content: string;
      metadata?: any;
    }
  ): Promise<ApplicationCommunication> {
    const { data, error } = await supabase
      .from('application_communications')
      .insert({
        application_id: applicationId,
        communication_type: communicationData.communication_type,
        communication_direction: communicationData.communication_direction,
        subject: communicationData.subject || null,
        content: communicationData.content,
        sent_at: new Date().toISOString(),
        metadata: communicationData.metadata || {},
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add application communication: ${error.message}`);
    }

    return data as ApplicationCommunication;
  }

  /**
   * Get application communications
   */
  static async getApplicationCommunications(applicationId: string): Promise<ApplicationCommunication[]> {
    const { data, error } = await supabase
      .from('application_communications')
      .select('*')
      .eq('application_id', applicationId)
      .order('sent_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch application communications: ${error.message}`);
    }

    return data as ApplicationCommunication[];
  }

  /**
   * Delete application (soft delete)
   */
  static async deleteApplication(applicationId: string): Promise<void> {
    const { error } = await supabase
      .from('job_applications')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId);

    if (error) {
      throw new Error(`Failed to delete application: ${error.message}`);
    }
  }

  /**
   * Get application statistics
   */
  static async getApplicationStats(jobId?: string, organizationId?: string): Promise<{
    total: number;
    pending: number;
    reviewing: number;
    shortlisted: number;
    rejected: number;
    hired: number;
    by_platform: Record<string, number>;
  }> {
    let query = supabase
      .from('job_applications')
      .select('application_status, platform');

    if (jobId) {
      query = query.eq('job_id', jobId);
    }
    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query.eq('is_active', true);

    if (error) {
      throw new Error(`Failed to fetch application stats: ${error.message}`);
    }

    const applications = data as JobApplication[];

    const stats = {
      total: applications.length,
      pending: applications.filter(a => a.application_status === 'pending').length,
      reviewing: applications.filter(a => a.application_status === 'reviewing').length,
      shortlisted: applications.filter(a => a.application_status === 'shortlisted').length,
      rejected: applications.filter(a => a.application_status === 'rejected').length,
      hired: applications.filter(a => a.application_status === 'hired').length,
      by_platform: applications.reduce((acc, app) => {
        acc[app.platform] = (acc[app.platform] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return stats;
  }

  /**
   * Search applications
   */
  static async searchApplications(searchParams: {
    organization_id?: string;
    job_id?: string;
    platform?: string;
    status?: string;
    search?: string; // Search in applicant name, email
  }): Promise<JobApplication[]> {
    let query = supabase
      .from('job_applications')
      .select('*')
      .eq('is_active', true);

    if (searchParams.organization_id) {
      query = query.eq('organization_id', searchParams.organization_id);
    }
    if (searchParams.job_id) {
      query = query.eq('job_id', searchParams.job_id);
    }
    if (searchParams.platform) {
      query = query.eq('platform', searchParams.platform);
    }
    if (searchParams.status) {
      query = query.eq('application_status', searchParams.status);
    }
    if (searchParams.search) {
      query = query.or(`applicant_name.ilike.%${searchParams.search}%,applicant_email.ilike.%${searchParams.search}%`);
    }

    const { data, error } = await query.order('applied_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to search applications: ${error.message}`);
    }

    return data as JobApplication[];
  }
}
