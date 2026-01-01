import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  const missing = [];
  if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  throw new Error(`Missing Supabase environment variables: ${missing.join(', ')}`);
}

const supabase = createClient(supabaseUrl, supabaseKey);

export type JobBoardPlatform = 'linkedin' | 'indeed' | 'naukri' | 'other';
export type IntegrationStatus = 'connected' | 'disconnected' | 'expired' | 'error';
export type PostingStatus = 'pending' | 'posted' | 'failed' | 'expired';

export interface JobBoardIntegration {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  organization_id: string | null;
  platform: JobBoardPlatform;
  status: IntegrationStatus;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  api_key: string | null;
  api_secret: string | null;
  platform_user_id: string | null;
  platform_email: string | null;
  platform_name: string | null;
  is_active: boolean;
  configuration: any;
  last_error: string | null;
  last_error_at: string | null;
}

export interface ExternalJobPosting {
  id: string;
  created_at: string;
  updated_at: string;
  job_id: string;
  integration_id: string;
  user_id: string;
  organization_id: string | null;
  platform: JobBoardPlatform;
  external_job_id: string | null;
  external_job_url: string | null;
  posting_status: PostingStatus;
  posted_at: string | null;
  expires_at: string | null;
  response_data: any;
  error_message: string | null;
  error_code: string | null;
  views: number;
  applications_count: number;
  metadata: any;
}


export class JobBoardIntegrationService {
  /**
   * Create or update a job board integration
   */
  static async upsertIntegration(data: {
    user_id: string;
    organization_id?: string;
    platform: JobBoardPlatform;
    access_token?: string;
    refresh_token?: string;
    token_expires_at?: string;
    api_key?: string;
    api_secret?: string;
    platform_user_id?: string;
    platform_email?: string;
    platform_name?: string;
    configuration?: any;
  }): Promise<JobBoardIntegration> {
    const integrationData: any = {
      user_id: data.user_id,
      organization_id: data.organization_id || null,
      platform: data.platform,
      status: 'connected' as IntegrationStatus,
      is_active: true,
      configuration: data.configuration || {},
    };

    // Store tokens directly (no encryption)
    if (data.access_token) {
      integrationData.access_token = data.access_token;
    }
    if (data.refresh_token) {
      integrationData.refresh_token = data.refresh_token;
    }
    if (data.api_key) {
      integrationData.api_key = data.api_key;
    }
    if (data.api_secret) {
      integrationData.api_secret = data.api_secret;
    }

    if (data.token_expires_at) {
      integrationData.token_expires_at = data.token_expires_at;
    }
    if (data.platform_user_id) {
      integrationData.platform_user_id = data.platform_user_id;
    }
    if (data.platform_email) {
      integrationData.platform_email = data.platform_email;
    }
    if (data.platform_name) {
      integrationData.platform_name = data.platform_name;
    }

    try {
      const { data: integration, error } = await supabase
        .from('job_board_integration')
        .upsert(integrationData, {
          onConflict: 'user_id,platform,organization_id',
          ignoreDuplicates: false,
        })
        .select()
        .single();

      if (error) {
        // Check if it's a table doesn't exist error
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          throw new Error('Database table "job_board_integration" not found. Please run the migration: supabase/migrations/add_job_board_integrations.sql');
        }
        // Check if it's an API key error
        if (error.message.includes('Invalid API key') || error.message.includes('JWT') || error.message.includes('invalid')) {
          throw new Error('Invalid Supabase API key. Please check SUPABASE_SERVICE_ROLE_KEY in your .env file. The key should be the "service_role" key from Supabase Settings → API.');
        }
        throw new Error(`Failed to save integration: ${error.message}`);
      }

      return integration as JobBoardIntegration;
    } catch (error: any) {
      console.error('upsertIntegration error:', error);
      // Re-throw with better error message if it's our custom error
      if (error.message.includes('Supabase') || error.message.includes('Database')) {
        throw error;
      }
      // Otherwise wrap in a more descriptive error
      throw new Error(`Failed to save integration: ${error.message}`);
    }
  }

  /**
   * Get all integrations for a user
   */
  static async getUserIntegrations(
    userId: string,
    organizationId?: string
  ): Promise<JobBoardIntegration[]> {
    try {
      let query = supabase
        .from('job_board_integration')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        // Check if it's a table doesn't exist error
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          throw new Error('Database tables not found. Please run the migration: supabase/migrations/add_job_board_integrations.sql');
        }
        // Check if it's an API key error
        if (error.message.includes('Invalid API key') || error.message.includes('JWT')) {
          throw new Error('Invalid Supabase API key. Please check SUPABASE_SERVICE_ROLE_KEY in your .env file');
        }
        throw new Error(`Failed to fetch integrations: ${error.message}`);
      }

      return (data || []) as JobBoardIntegration[];
    } catch (error: any) {
      console.error('getUserIntegrations error:', error);
      throw error;
    }
  }

  /**
   * Get integration by ID
   */
  static async getIntegrationById(integrationId: string): Promise<JobBoardIntegration | null> {
    const { data, error } = await supabase
      .from('job_board_integration')
      .select('*')
      .eq('id', integrationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch integration: ${error.message}`);
    }

    return data as JobBoardIntegration;
  }

  /**
   * Get access token
   */
  static async getDecryptedAccessToken(integrationId: string): Promise<string | null> {
    const integration = await this.getIntegrationById(integrationId);
    return integration?.access_token || null;
  }

  /**
   * Get API key
   */
  static async getDecryptedApiKey(integrationId: string): Promise<string | null> {
    const integration = await this.getIntegrationById(integrationId);
    return integration?.api_key || null;
  }

  /**
   * Get refresh token
   */
  static async getDecryptedRefreshToken(integrationId: string): Promise<string | null> {
    const integration = await this.getIntegrationById(integrationId);
    return integration?.refresh_token || null;
  }

  /**
   * Update integration status
   */
  static async updateIntegrationStatus(
    integrationId: string,
    status: IntegrationStatus,
    error?: string
  ): Promise<void> {
    const updateData: any = {
      status,
    };

    if (error) {
      updateData.last_error = error;
      updateData.last_error_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('job_board_integration')
      .update(updateData)
      .eq('id', integrationId);

    if (updateError) {
      throw new Error(`Failed to update integration status: ${updateError.message}`);
    }
  }

  /**
   * Disconnect an integration
   */
  static async disconnectIntegration(integrationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('job_board_integration')
      .update({
        status: 'disconnected',
        is_active: false,
        access_token: null,
        refresh_token: null,
        api_key: null,
        api_secret: null,
      })
      .eq('id', integrationId)
      .eq('user_id', userId); // Security: ensure user owns this integration

    if (error) {
      throw new Error(`Failed to disconnect integration: ${error.message}`);
    }
  }

  /**
   * Create external job posting record
   */
  static async createExternalPosting(data: {
    job_id: string;
    integration_id: string;
    user_id: string;
    organization_id?: string;
    platform: JobBoardPlatform;
    external_job_id?: string;
    external_job_url?: string;
    posting_status?: PostingStatus;
    response_data?: any;
    metadata?: any;
  }): Promise<ExternalJobPosting> {
    const { data: posting, error } = await supabase
      .from('external_job_posting')
      .insert({
        job_id: data.job_id,
        integration_id: data.integration_id,
        user_id: data.user_id,
        organization_id: data.organization_id || null,
        platform: data.platform,
        external_job_id: data.external_job_id || null,
        external_job_url: data.external_job_url || null,
        posting_status: data.posting_status || 'pending',
        response_data: data.response_data || {},
        metadata: data.metadata || {},
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create external posting: ${error.message}`);
    }

    return posting as ExternalJobPosting;
  }

  /**
   * Update external posting status
   */
  static async updateExternalPosting(
    postingId: string,
    updates: {
      posting_status?: PostingStatus;
      external_job_id?: string;
      external_job_url?: string;
      posted_at?: string;
      expires_at?: string;
      response_data?: any;
      error_message?: string;
      error_code?: string;
      views?: number;
      applications_count?: number;
    }
  ): Promise<void> {
    const { error } = await supabase
      .from('external_job_posting')
      .update(updates)
      .eq('id', postingId);

    if (error) {
      throw new Error(`Failed to update external posting: ${error.message}`);
    }
  }

  /**
   * Get external postings for a job
   */
  static async getJobExternalPostings(jobId: string): Promise<ExternalJobPosting[]> {
    const { data, error } = await supabase
      .from('external_job_posting')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch external postings: ${error.message}`);
    }

    return (data || []) as ExternalJobPosting[];
  }
}

