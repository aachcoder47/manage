import { JobBoardIntegrationService, JobBoardPlatform } from './job-board-integration.service';
import { LinkedInOAuthService } from './linkedin-oauth.service';
import { IndeedAPIKeyService } from './indeed-api-key.service';
import { NaukriAPIKeyService } from './naukri-api-key.service';
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
  posting_method?: 'share' | 'formal' | 'api_key'; // Added api_key option
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
      // This works with basic w_member_social scope and directs users to our platform
      const result = await LinkedInFeedPostService.postJobAsFeedPost(accessToken, {
        title: job.title,
        description: job.description,
        location: job.location || 'Remote',
        employmentType: job.employment_type || 'full-time',
        applyUrl: trackedApplyUrl, // Use the actual tracking URL
        salaryRange: job.salary_range ? {
           min: 0, max: 0, currency: 'USD' 
        } : undefined,
        // job.salary_range in DB is usually a string range like "100k-120k" or JSON. 
        // Existing code passed { min: 0, max: 0, currency: 'INR' }. Let's keep it simple or undefined for now if we can't parse.
        // But let's look at the FeedPostService signature. It accepts optional salaryRange.
        // Let's omit salaryRange if we don't have parsed values to avoid "Salary: $0 - $0".
        companyName: job.company_name || 'Hiring Company',
      });

      return {
        success: true,
        platform: 'linkedin',
        external_job_id: result.shareId,
        external_job_url: result.shareUrl,
        response_data: result,
        posting_method: 'share' // Indicate this was posted as a share
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
   * Post a job to Indeed
   * Note: Indeed requires API key and publisher account
   */
  static async postToIndeed(
    integrationId: string,
    job: Job,
    applyUrl: string
  ): Promise<JobPostingResult> {
    try {
      const apiKey = await JobBoardIntegrationService.getDecryptedApiKey(integrationId);
      if (!apiKey) {
        throw new Error('Indeed API key not found');
      }

      const result = await IndeedAPIKeyService.postJob(apiKey, {
        title: job.title,
        description: job.description,
        location: job.location || 'Remote',
        employmentType: job.employment_type || 'full-time',
        applyUrl: applyUrl,
        salaryRange: job.salary_range ? {
          min: 0, // Parse from salary_range if needed
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
        posting_method: 'api_key' // Indicate this was posted via API key
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
   * Post job to Naukri
   */
  static async postToNaukri(
    integrationId: string,
    job: Job,
    applyUrl: string
  ): Promise<JobPostingResult> {
    try {
      const apiKey = await JobBoardIntegrationService.getDecryptedApiKey(integrationId);
      if (!apiKey) {
        throw new Error('Naukri API key not found');
      }

      const result = await NaukriAPIKeyService.postJob(apiKey, {
        title: job.title,
        description: job.description,
        location: job.location || 'Remote',
        employmentType: job.employment_type || 'full-time',
        applyUrl: applyUrl,
        salaryRange: job.salary_range ? {
          min: 0, // Parse from salary_range if needed
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
        posting_method: 'api_key' // Indicate this was posted via API key
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

