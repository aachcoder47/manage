// services/naukri-api-key.service.ts
import { createClient } from '@supabase/supabase-js';

export class NaukriAPIKeyService {
    private static readonly NAUKRI_API_BASE = 'https://api.naukri.com';
    private static readonly NAUKRI_AUTH_BASE = 'https://login.naukri.com/oauth2';

    /**
     * Store Naukri API key
     */
    static async storeAPIKey(
        userId: string,
        organizationId: string | null,
        apiKey: string,
        apiSecret: string,
        companyId?: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            const { error } = await supabase
                .from('naukri_api_keys')
                .upsert({
                    user_id: userId,
                    organization_id: organizationId,
                    api_key: apiKey,
                    api_secret: apiSecret,
                    company_id: companyId || null,
                    status: 'active',
                    configuration: {},
                    rate_limit_remaining: 1000,
                    rate_limit_reset_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                }, {
                    onConflict: 'user_id'
                });

            if (error) {
                throw new Error(`Failed to store Naukri API key: ${error.message}`);
            }

            return { success: true };
        } catch (error: any) {
            console.error('Naukri API key storage error:', error);
            return {
                success: false,
                error: error.message || 'Failed to store Naukri API key'
            };
        }
    }

    /**
     * Get Naukri API key
     */
    static async getAPIKey(userId: string): Promise<{ success: boolean; apiKey?: string; apiSecret?: string; companyId?: string; error?: string }> {
        try {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            const { data, error } = await supabase
                .from('naukri_api_keys')
                .select('api_key, api_secret, company_id, status, last_used_at, usage_count, rate_limit_remaining')
                .eq('user_id', userId)
                .eq('status', 'active')
                .single();

            if (error) {
                throw new Error(`Failed to fetch Naukri API key: ${error.message}`);
            }

            if (!data) {
                return {
                    success: false,
                    error: 'Naukri API key not found. Please configure your Naukri API key.'
                };
            }

            // Update last used time and usage count
            await supabase
                .from('naukri_api_keys')
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
                companyId: data.company_id
            };
        } catch (error: any) {
            console.error('Naukri API key fetch error:', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch Naukri API key'
            };
        }
    }

    /**
     * Delete Naukri API key
     */
    static async deleteAPIKey(userId: string): Promise<{ success: boolean; error?: string }> {
        try {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            const { error } = await supabase
                .from('naukri_api_keys')
                .delete()
                .eq('user_id', userId);

            if (error) {
                throw new Error(`Failed to delete Naukri API key: ${error.message}`);
            }

            return { success: true };
        } catch (error: any) {
            console.error('Naukri API key deletion error:', error);
            return {
                success: false,
                error: error.message || 'Failed to delete Naukri API key'
            };
        }
    }

    /**
     * Post a job to Naukri using API key
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
            // Map employment type to Naukri format
            const employmentTypeMap: Record<string, string> = {
                'full-time': 'Full Time',
                'part-time': 'Part Time',
                'contract': 'Contract',
                'temporary': 'Temporary',
                'intern': 'Internship',
                'freelance': 'Freelance',
                'commission': 'Commission',
            };

            const naukriEmploymentType = employmentTypeMap[jobData.employmentType?.toLowerCase()] || 'Full Time';

            // Create Naukri job posting
            const naukriJobData = {
                title: jobData.title,
                description: jobData.description,
                location: jobData.location,
                employmentType: naukriEmploymentType,
                applyMethod: {
                    type: 'EXTERNAL',
                    applyUrl: jobData.applyUrl,
                },
                ...(jobData.salaryRange && {
                    salary: {
                        min: jobData.salaryRange.min,
                        max: jobData.salaryRange.max,
                        currency: jobData.salaryRange.currency,
                    },
                }),
                ...(jobData.companyName && {
                    companyName: jobData.companyName,
                    companyDescription: jobData.companyDescription,
                    companyUrl: jobData.companyUrl,
                }),
            };

            const response = await fetch(`${this.NAUKRI_API_BASE}/jobpostings/v2/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(naukriJobData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Naukri API error (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            
            return {
                success: true,
                jobId: data.id,
                jobUrl: data.jobUrl || `https://www.naukri.com/job-posting/view/${data.id}`,
            };
        } catch (error: any) {
            console.error('Naukri posting error:', error);
            
            if (error.message.includes('401')) {
                return {
                    success: false,
                    error: 'Naukri API key invalid or expired. Please check your API key configuration.'
                };
            }
            if (error.message.includes('403')) {
                return {
                    success: false,
                    error: 'Naukri API key does not have job posting permissions. Please check your API key permissions.'
                };
            }
            if (error.message.includes('429')) {
                return {
                    success: false,
                    error: 'Naukri API rate limit exceeded. Please try again later.'
                };
            }
            
            return {
                success: false,
                error: error.message || 'Failed to post job to Naukri'
            };
        }
    }

    /**
     * Get job status from Naukri
     */
    static async getJobStatus(
        apiKey: string,
        jobId: string
    ): Promise<{ success: boolean; status?: string; views?: number; applications?: number; error?: string }> {
        try {
            const response = await fetch(`${this.NAUKRI_API_BASE}/jobpostings/v2/status/${jobId}`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to get Naukri job status');
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
                error: error.message || 'Failed to get Naukri job status'
            };
        }
    }

    /**
     * Update job on Naukri
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
                'full-time': 'Full Time',
                'part-time': 'Part Time',
                'contract': 'Contract',
                'temporary': 'Temporary',
                'intern': 'Internship',
                'freelance': 'Freelance',
                'commission': 'Commission',
            };

            const naukriEmploymentType = employmentTypeMap[jobData.employmentType?.toLowerCase()] || 'Full Time';

            const response = await fetch(`${this.NAUKRI_API_BASE}/jobpostings/v2/update/${jobId}`, {
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
                    employmentType: naukriEmploymentType,
                    applyMethod: {
                        type: 'EXTERNAL',
                        applyUrl: jobData.applyUrl,
                    },
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update Naukri job');
            }

            return { success: true };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to update Naukri job'
            };
        }
    }

    /**
     * Delete job from Naukri
     */
    static async deleteJob(
        apiKey: string,
        jobId: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch(`${this.NAUKRI_API_BASE}/jobpostings/v2/delete/${jobId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete Naukri job');
            }

            return { success: true };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to delete Naukri job'
            };
        }
    }

    /**
     * Generate manual posting URL for Naukri
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
        
        return `https://www.naukri.com/job-posting/new?${params.toString()}`;
    }

    /**
     * Get Naukri job posting status
     */
    static async getJobPostingStatus(
        apiKey: string,
        jobId: string
    ): Promise<{ success: boolean; status?: string; postedAt?: string; expiresAt?: string; error?: string }> {
        try {
            const response = await fetch(`${this.NAUKRI_API_BASE}/jobpostings/v2/status/${jobId}`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to get Naukri job posting status: ${response.status}`);
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
                error: error.message || 'Failed to get Naukri job posting status'
            };
        }
    }
}
