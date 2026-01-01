// Update job board posting service to remove LinkedIn support
// This will remove LinkedIn from the supported platforms

import { JobBoardIntegrationService, JobBoardPlatform } from './job-board-integration.service';
import { IndeedAPIKeyService } from './indeed-api-key.service';
import { NaukriAPIKeyService } from './naukri-api-key.service';
import { Job } from '@/types/job';

export interface JobPostingResult {
  success: boolean;
  platform: JobBoardPlatform;
  external_job_id?: string;
  external_job_url?: string;
  error?: string;
  error_code?: string;
  response_data?: any;
  posting_method?: 'api_key'; // Only API key method now
}

export class JobBoardPostingService {
  /**
   * Post job to Indeed using API key
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
        posting_method: 'api_key'
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
   * Post job to Naukri using API key
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
        posting_method: 'api_key'
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
   * Post job to multiple platforms (Indeed and Naukri only)
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
