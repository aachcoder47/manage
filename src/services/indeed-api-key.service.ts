// services/indeed-api-key.service.ts
import { createClient } from '@supabase/supabase-js';

export class IndeedAPIKeyService {
    private static readonly INDEED_API_BASE = 'https://api.indeed.com/ads/apis/v2';
    private static readonly INDEED_PUBLISHER_BASE = 'https://api.indeed.com/ads/apis/v2';

    /**
     * Store Indeed API key
     */
    static async storeAPIKey(
        userId: string,
        organizationId: string | null,
        apiKey: string,
        apiSecret: string,
        publisherId?: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            const { error } = await supabase
                .from('indeed_api_keys')
                .upsert({
                    user_id: userId,
                    organization_id: organizationId,
                    api_key: apiKey,
                    api_secret: apiSecret,
                    publisher_id: publisherId || null,
                    status: 'active',
                    configuration: {},
                    rate_limit_remaining: 1000,
                    rate_limit_reset_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                }, {
                    onConflict: 'user_id'
                });

            if (error) {
                throw new Error(`Failed to store Indeed API key: ${error.message}`);
            }

            return { success: true };
        } catch (error: any) {
            console.error('Indeed API key storage error:', error);
            return {
                success: false,
                error: error.message || 'Failed to store Indeed API key'
            };
        }
    }

    /**
     * Get Indeed API key
     */
    static async getAPIKey(userId: string): Promise<{ success: boolean; apiKey?: string; apiSecret?: string; publisherId?: string; error?: string }> {
        try {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            const { data, error } = await supabase
                .from('indeed_api_keys')
                .select('api_key, api_secret, publisher_id, status, last_used_at, usage_count, rate_limit_remaining')
                .eq('user_id', userId)
                .eq('status', 'active')
                .single();

            if (error) {
                throw new Error(`Failed to fetch Indeed API key: ${error.message}`);
            }

            if (!data) {
                return {
                    success: false,
                    error: 'Indeed API key not found. Please configure your Indeed API key.'
                };
            }

            // Update last used time and usage count
            await supabase
                .from('indeed_api_keys')
                .update({
                    last_used_at: new Date().toISOString(),
                    usage_count: data.usage_count + 1,
                    rate_limit_remaining: Math.max(0, data.rate_limit_remaining - 1)
                })
                .eq('user_id', userId);

            return {
                success: true,
                apiKey: data.api_key,
                apiSecret: data.api_secret,
                publisherId: data.publisher_id
            };
        } catch (error: any) {
            console.error('Indeed API key fetch error:', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch Indeed API key'
            };
        }
    }

    /**
     * Delete Indeed API key
     */
    static async deleteAPIKey(userId: string): Promise<{ success: boolean; error?: string }> {
        try {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            const { error } = await supabase
                .from('indeed_api_keys')
                .delete()
                .eq('user_id', userId);

            if (error) {
                throw new Error(`Failed to delete Indeed API key: ${error.message}`);
            }

            return { success: true };
        } catch (error: any) {
            console.error('Indeed API key deletion error:', error);
            return {
                success: false,
                error: error.message || 'Failed to delete Indeed API key'
            };
        }
    }

    /**
     * Post a job to Indeed using API key
     */
    static async postJob(
        apiKey: string,
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
            companyUrl?: string;
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
                'commission': 'COMMISSION',
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
                        website: jobData.companyUrl,
                    },
                }),
            };

            const response = await fetch(`${this.INDEED_API_BASE}/jobpostings`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(indeedJobData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Indeed API error (${response.status}): ${errorText}`);
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
                    error: 'Indeed API key invalid or expired. Please check your API key configuration.'
                };
            }
            if (error.message.includes('403')) {
                return {
                    success: false,
                    error: 'Indeed API key does not have job posting permissions. Please check your API key permissions.'
                };
            }
            if (error.message.includes('429')) {
                return {
                    success: false,
                    error: 'Indeed API rate limit exceeded. Please try again later.'
                };
            }
            
            return {
                success: false,
                error: error.message || 'Failed to post job to Indeed'
            };
        }
    }

    /**
     * Get job status from Indeed
     */
    static async getJobStatus(
        apiKey: string,
        jobId: string
    ): Promise<{ success: boolean; status?: string; views?: number; applications?: number; error?: string }> {
        try {
            const response = await fetch(`${this.INDEED_API_BASE}/jobpostings/${jobId}`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to get Indeed job status: ${response.status}`);
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
                error: error.message || 'Failed to get Indeed job status'
            };
        }
    }

    /**
     * Update job on Indeed
     */
    static async updateJob(
        apiKey: string,
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
                'volunteer': 'VOLUNTEER',
                'commission': 'COMMISSION',
            };

            const indeedEmploymentType = employmentTypeMap[jobData.employmentType?.toLowerCase()] || 'FULL_TIME';

            const response = await fetch(`${this.INDEED_API_BASE}/jobpostings/${jobId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
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
                error: error.message || 'Failed to update Indeed job'
            };
        }
    }

    /**
     * Delete job from Indeed
     */
    static async deleteJob(
        apiKey: string,
        jobId: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch(`${this.INDEED_API_BASE}/jobpostings/${jobId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete Indeed job');
            }

            return { success: true };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to delete Indeed job'
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

    /**
     * Get Indeed job posting status
     */
    static async getJobPostingStatus(
        apiKey: string,
        jobId: string
    ): Promise<{ success: boolean; status?: string; postedAt?: string; expiresAt?: string; error?: string }> {
        try {
            const response = await fetch(`${this.INDEED_API_BASE}/jobpostings/${jobId}`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to get Indeed job posting status: ${response.status}`);
            }

            const data = await response.json();
            
            return {
                success: true,
                status: data.status,
                postedAt: data.postedAt,
                expiresAt: data.expiresAt,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to get Indeed job posting status'
            };
        }
    }
}
