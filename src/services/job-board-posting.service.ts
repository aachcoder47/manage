import { JobBoardIntegrationService, JobBoardPlatform } from './job-board-integration.service';
import { LinkedInOAuthService } from './linkedin-oauth.service';
import { IndeedOAuthService } from './indeed-oauth.service';
import { NaukriOAuthService } from './naukri-oauth.service';
import { LinkedInFeedPostService } from './linkedin-feed-post.service';
import { Job } from '@/types/job';

export interface JobPostingResult {
  success: boolean;
  platform: JobBoardPlatform;
  external_job_id?: string;
  external_job_url?: string;
  error?: string;
  error_code?: string;
  response_data?: any;
  posting_method?: 'share' | 'formal' | 'api_key' | 'oauth';
}

export class JobBoardPostingService {
  /**
   * Post a job to LinkedIn
   */
  static async postToLinkedIn(
    integrationId: string,
    job: Job,
    applyUrl: string
  ): Promise<JobPostingResult> {
    // Add source tracking to apply URL
    const trackedApplyUrl = `${applyUrl}${applyUrl.includes('?') ? '&' : '?'}source=linkedin&utm_source=linkedin`;
    try {
      // Get and refresh token if needed
      const integration = await JobBoardIntegrationService.getIntegrationById(integrationId);
      if (!integration) {
        throw new Error('Integration not found');
      }

      let accessToken = await JobBoardIntegrationService.getDecryptedAccessToken(integrationId);
      if (!accessToken) {
        throw new Error('Access token not found');
      }

      // Check if token is expired and refresh if needed
      if (LinkedInOAuthService.isTokenExpired(integration.token_expires_at)) {
        const refreshToken = await JobBoardIntegrationService.getDecryptedRefreshToken(integrationId);
        if (refreshToken) {
          const tokenResponse = await LinkedInOAuthService.refreshAccessToken(refreshToken);
          accessToken = tokenResponse.access_token;

          // Update integration with new token
          await JobBoardIntegrationService.upsertIntegration({
            user_id: integration.user_id,
            organization_id: integration.organization_id || undefined,
            platform: 'linkedin',
            access_token: tokenResponse.access_token,
            refresh_token: tokenResponse.refresh_token || refreshToken,
            token_expires_at: LinkedInOAuthService.calculateExpirationDate(
              tokenResponse.expires_in
            ),
          });
        } else {
          throw new Error('Token expired and no refresh token available');
        }
      }

      // Map employment type
      const employmentTypeMap: Record<string, 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'TEMPORARY' | 'INTERN'> = {
        'full-time': 'FULL_TIME',
        'part-time': 'PART_TIME',
        'contract': 'CONTRACT',
        'temporary': 'TEMPORARY',
        'intern': 'INTERN',
      };

      const employmentType =
        employmentTypeMap[job.employment_type?.toLowerCase() || ''] || 'FULL_TIME';

      // Use LinkedInFeedPostService to create a "We're Hiring" feed post
      const result = await LinkedInFeedPostService.postJobAsFeedPost(accessToken, {
        title: job.title,
        description: job.description,
        location: job.location || 'Remote',
        employmentType: job.employment_type || 'full-time',
        applyUrl: trackedApplyUrl,
        salaryRange: job.salary_range ? {
           min: 0, max: 0, currency: 'USD' 
        } : undefined,
        companyName: job.company_name || 'Hiring Company',
      });

      return {
        success: true,
        platform: 'linkedin',
        external_job_id: result.shareId,
        external_job_url: result.shareUrl,
        response_data: result,
        posting_method: 'share'
      };
    } catch (error: any) {
      console.error('LinkedIn posting error:', error);
      return {
        success: false,
        platform: 'linkedin',
        error: error.message || 'Failed to post to LinkedIn',
        error_code: error.code || 'POSTING_ERROR',
      };
    }
  }

  /**
   * Post a job to Indeed via OAuth
   */
  static async postToIndeed(
    integrationId: string,
    job: Job,
    applyUrl: string
  ): Promise<JobPostingResult> {
    try {
      // Get integration and tokens
      const integration = await JobBoardIntegrationService.getIntegrationById(integrationId);
      if (!integration) {
        throw new Error('Indeed integration not found');
      }

      let accessToken = await JobBoardIntegrationService.getDecryptedAccessToken(integrationId);
      if (!accessToken) {
        throw new Error('Indeed access token not found');
      }

      // Check expiry and refresh
      const isExpired = !integration.token_expires_at || new Date() >= new Date(integration.token_expires_at);
      if (isExpired) {
        const refreshToken = await JobBoardIntegrationService.getDecryptedRefreshToken(integrationId);
        if (refreshToken) {
          const tokenResponse = await IndeedOAuthService.refreshToken(refreshToken);
          accessToken = tokenResponse.access_token;

          await JobBoardIntegrationService.upsertIntegration({
            user_id: integration.user_id,
            platform: 'indeed',
            access_token: tokenResponse.access_token,
            // If new refresh token provided, use it, else keep old
            // Indeed usually rotates refresh tokens? Check response type.
            // Our service returns { access_token, expires_in }, possibly refresh_token?
            // IndeedOAuthService.refreshToken returns Promise<{ access_token: string; expires_in: number }>
            // So we reuse the old refresh token unless we want to re-auth.
            // Wait, does Indeed rotate usage? Often yes. But if service doesn't return it...
            // Let's assume reuse for now or that we need to implement rotation if service provides it.
            refresh_token: refreshToken, 
            token_expires_at: new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString(),
          });
        } else {
          throw new Error('Indeed token expired and no refresh token available');
        }
      }

      // Add source tracking to apply URL
      const trackedApplyUrl = `${applyUrl}${applyUrl.includes('?') ? '&' : '?'}source=indeed&utm_source=indeed`;

      const result = await IndeedOAuthService.postJob(accessToken, {
        title: job.title,
        description: job.description,
        location: job.location || 'Remote',
        employmentType: job.employment_type || 'full-time',
        applyUrl: trackedApplyUrl,
        salaryRange: job.salary_range ? {
          min: 0,
          max: 0,
          currency: 'INR',
        } : undefined,
        companyName: job.company_name || 'Company Name',
        companyDescription: job.company_description || 'Company Description',
      });

      return {
        success: true,
        platform: 'indeed',
        external_job_id: result.jobId,
        external_job_url: result.jobUrl,
        response_data: result,
        posting_method: 'oauth'
      };
    } catch (error: any) {
      console.error('Indeed posting error:', error);
      return {
        success: false,
        platform: 'indeed',
        error: error.message || 'Failed to post to Indeed',
        error_code: error.code || 'POSTING_ERROR',
      };
    }
  }

  /**
   * Post job to Naukri via OAuth
   */
  static async postToNaukri(
    integrationId: string,
    job: Job,
    applyUrl: string
  ): Promise<JobPostingResult> {
    try {
      const integration = await JobBoardIntegrationService.getIntegrationById(integrationId);
      if (!integration) {
        throw new Error('Naukri integration not found');
      }

      let accessToken = await JobBoardIntegrationService.getDecryptedAccessToken(integrationId);
      if (!accessToken) {
        throw new Error('Naukri access token not found');
      }

      // Check expiry and refresh
      const isExpired = !integration.token_expires_at || new Date() >= new Date(integration.token_expires_at);
      if (isExpired) {
        const refreshToken = await JobBoardIntegrationService.getDecryptedRefreshToken(integrationId);
        if (refreshToken) {
          const tokenResponse = await NaukriOAuthService.refreshToken(refreshToken);
          accessToken = tokenResponse.access_token;

          await JobBoardIntegrationService.upsertIntegration({
            user_id: integration.user_id,
            platform: 'naukri',
            access_token: tokenResponse.access_token,
            refresh_token: refreshToken,
            token_expires_at: new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString(),
          });
        } else {
          throw new Error('Naukri token expired and no refresh token available');
        }
      }

      // Add source tracking to apply URL
      const trackedApplyUrl = `${applyUrl}${applyUrl.includes('?') ? '&' : '?'}source=naukri&utm_source=naukri`;

      const result = await NaukriOAuthService.postJob(accessToken, {
        title: job.title,
        description: job.description,
        location: job.location || 'Remote',
        employmentType: job.employment_type || 'full-time',
        applyUrl: trackedApplyUrl,
        salaryRange: job.salary_range ? {
          min: 0,
          max: 0,
          currency: 'INR',
        } : undefined,
        companyName: job.company_name || 'Company Name',
        companyDescription: job.company_description || 'Company Description',
      });

      return {
        success: true,
        platform: 'naukri',
        external_job_id: result.jobId,
        external_job_url: result.jobUrl,
        response_data: result,
        posting_method: 'oauth'
      };
    } catch (error: any) {
      console.error('Naukri posting error:', error);
      return {
        success: false,
        platform: 'naukri',
        error: error.message || 'Failed to post to Naukri',
        error_code: error.code || 'POSTING_ERROR',
      };
    }
  }

  /**
   * Post job to multiple platforms
   */
  static async postToMultiplePlatforms(
    integrationIds: string[],
    job: Job,
    applyUrl: string
  ): Promise<JobPostingResult[]> {
    const results: JobPostingResult[] = [];

    for (const integrationId of integrationIds) {
      const integration = await JobBoardIntegrationService.getIntegrationById(integrationId);
      if (!integration) {
        results.push({
          success: false,
          platform: 'other',
          error: 'Integration not found',
        });
        continue;
      }

      let result: JobPostingResult;
      switch (integration.platform) {
        case 'linkedin':
          result = await this.postToLinkedIn(integrationId, job, applyUrl);
          break;
        case 'indeed':
          result = await this.postToIndeed(integrationId, job, applyUrl);
          break;
        case 'naukri':
          result = await this.postToNaukri(integrationId, job, applyUrl);
          break;
        default:
          result = {
            success: false,
            platform: integration.platform,
            error: 'Platform not supported',
          };
      }

      results.push(result);
    }

    return results;
  }
}

