// services/indeed-oauth.service.ts
import { JobBoardIntegrationService } from './job-board-integration.service';

export class IndeedOAuthService {
  private static readonly INDEED_API_BASE = 'https://api.indeed.com/ads/apis/v2';
  private static readonly INDEED_AUTH_URL = 'https://secure.indeed.com/oauth2/authorize';

  /**
   * Get Indeed OAuth URL
   */
  static getAuthUrl(userId: string, redirectUri: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.INDEED_CLIENT_ID || '',
      redirect_uri: redirectUri,
      scope: 'employer_job_posting employer_read',
      state: userId,
    });

    return `${this.INDEED_AUTH_URL}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  static async exchangeCodeForToken(
    code: string,
    redirectUri: string
  ): Promise<{ access_token: string; expires_in: number; refresh_token?: string }> {
    const response = await fetch('https://secure.indeed.com/oauth2/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: process.env.INDEED_CLIENT_ID || '',
        client_secret: process.env.INDEED_CLIENT_SECRET || '',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange Indeed authorization code');
    }

    return response.json();
  }

  /**
   * Refresh Indeed access token
   */
  static async refreshToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
    const response = await fetch('https://secure.indeed.com/oauth2/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.INDEED_CLIENT_ID || '',
        client_secret: process.env.INDEED_CLIENT_SECRET || '',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh Indeed access token');
    }

    return response.json();
  }

  /**
   * Post a job to Indeed
   */
  static async postJob(
    accessToken: string,
    jobData: {
      title: string;
      description: string;
      location: string;
      employmentType: string;
      applyUrl: string;
      salaryRange?: {
        min: number;
        max: number;
        currency: string;
      };
      companyName?: string;
      companyDescription?: string;
    }
  ): Promise<{ success: boolean; jobId?: string; jobUrl?: string; error?: string }> {
    try {
      // Map employment type to Indeed format
      const employmentTypeMap: Record<string, string> = {
        'full-time': 'FULL_TIME',
        'part-time': 'PART_TIME',
        'contract': 'CONTRACT',
        'temporary': 'TEMPORARY',
        'intern': 'INTERNSHIP',
        'volunteer': 'VOLUNTEER',
      };

      const indeedEmploymentType = employmentTypeMap[jobData.employmentType?.toLowerCase()] || 'FULL_TIME';

      // Create Indeed job posting
      const indeedJobData = {
        title: jobData.title,
        description: jobData.description,
        location: jobData.location,
        employmentType: indeedEmploymentType,
        applyMethod: {
          type: 'EXTERNAL',
          applyUrl: jobData.applyUrl,
        },
        ...(jobData.salaryRange && {
          compensation: {
            min: jobData.salaryRange.min,
            max: jobData.salaryRange.max,
            currency: jobData.salaryRange.currency,
            type: 'YEARLY',
          },
        }),
        ...(jobData.companyName && {
          company: {
            name: jobData.companyName,
            description: jobData.companyDescription,
          },
        }),
      };

      const response = await fetch(`${this.INDEED_API_BASE}/jobpostings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(indeedJobData),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to post job to Indeed: ${error}`);
      }

      const data = await response.json();
      return {
        success: true,
        jobId: data.id,
        jobUrl: data.viewUrl || `https://www.indeed.com/viewjob?jk=${data.id}`,
      };
    } catch (error: any) {
      console.error('Indeed posting error:', error);
      
      if (error.message.includes('401')) {
        return {
          success: false,
          error: 'Indeed access token expired. Please reconnect your Indeed account.'
        };
      }
      
      if (error.message.includes('403')) {
        return {
          success: false,
          error: 'Indeed permission denied. Please ensure your app has job posting permissions.'
        };
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get job status from Indeed
   */
  static async getJobStatus(
    accessToken: string,
    jobId: string
  ): Promise<{ success: boolean; status?: string; views?: number; applications?: number; error?: string }> {
    try {
      const response = await fetch(`${this.INDEED_API_BASE}/jobpostings/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get Indeed job status');
      }

      const data = await response.json();
      return {
        success: true,
        status: data.status,
        views: data.views || 0,
        applications: data.applications || 0,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update job on Indeed
   */
  static async updateJob(
    accessToken: string,
    jobId: string,
    jobData: {
      title: string;
      description: string;
      location: string;
      employmentType: string;
      applyUrl: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const employmentTypeMap: Record<string, string> = {
        'full-time': 'FULL_TIME',
        'part-time': 'PART_TIME',
        'contract': 'CONTRACT',
        'temporary': 'TEMPORARY',
        'intern': 'INTERNSHIP',
      };

      const indeedEmploymentType = employmentTypeMap[jobData.employmentType?.toLowerCase()] || 'FULL_TIME';

      const response = await fetch(`${this.INDEED_API_BASE}/jobpostings/${jobId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: jobData.title,
          description: jobData.description,
          location: jobData.location,
          employmentType: indeedEmploymentType,
          applyMethod: {
            type: 'EXTERNAL',
            applyUrl: jobData.applyUrl,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update Indeed job');
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete job from Indeed
   */
  static async deleteJob(
    accessToken: string,
    jobId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.INDEED_API_BASE}/jobpostings/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete Indeed job');
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate manual posting URL for Indeed
   */
  static generateManualPostingUrl(jobData: {
    title: string;
    description: string;
    location: string;
    applyUrl: string;
  }): string {
    const params = new URLSearchParams({
      title: jobData.title,
      description: jobData.description,
      location: jobData.location,
      applyUrl: jobData.applyUrl,
    });
    
    return `https://ads.indeed.com/jobpost/new?${params.toString()}`;
  }
}
