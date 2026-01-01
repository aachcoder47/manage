// services/naukri-oauth.service.ts
import { createClient } from '@supabase/supabase-js';

export class NaukriOAuthService {
    private static readonly NAUKRI_API_BASE = 'https://api.naukri.com';
    private static readonly NAUKRI_AUTH_URL = 'https://login.naukri.com/oauth2/authorize';

    /**
     * Get Naukri OAuth URL
     */
    static getAuthUrl(userId: string, redirectUri: string): string {
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: process.env.NAUKRI_CLIENT_ID || '',
            redirect_uri: redirectUri,
            scope: 'employer_job_posting employer_read',
            state: userId,
        });

        return `${this.NAUKRI_AUTH_URL}?${params.toString()}`;
    }

    /**
     * Exchange authorization code for access token
     */
    static async exchangeCodeForToken(
        code: string,
        redirectUri: string
    ): Promise<{ access_token: string; expires_in: number; refresh_token?: string }> {
        const response = await fetch('https://login.naukri.com/oauth2/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectUri,
                client_id: process.env.NAUUKRI_CLIENT_ID || '',
                client_secret: process.env.NAUKRI_CLIENT_SECRET || '',
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to exchange Naukri authorization code');
        }

        return response.json();
    }

    /**
     * Refresh Naukri access token
     */
    static async refreshToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
        const response = await fetch('https://login.naukri.com/oauth2/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refreshToken,
                client_id: process.env.NAUKRI_CLIENT_ID || '',
                client_secret: process.env.NAUKRI_CLIENT_SECRET || '',
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to refresh Naukri access token');
        }

        return response.json();
    }

    /**
     * Post a job to Naukri
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
            // Map employment type to Naukri format
            const employmentTypeMap: Record<string, string> = {
                'full-time': 'Full Time',
                'part-time': 'Part Time',
                'contract': 'Contract',
                'temporary': 'Temporary',
                'intern': 'Internship',
                'freelance': 'Freelance',
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
                }),
            };

            const response = await fetch(`${this.NAUKRI_API_BASE}/jobpostings/v2/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(naukriJobData),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Failed to post job to Naukri: ${error}`);
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
                    error: 'Naukri access token expired. Please reconnect your Naukri account.'
                };
            }
            if (error.message.includes('403')) {
                return {
                    success: false,
                    error: 'Naukri permission denied. Please ensure your app has job posting permissions.'
                };
            }
            
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get job status from Naukri
     */
    static async getJobStatus(
        accessToken: string,
        jobId: string
    ): Promise<{ success: boolean; status?: string; views?: number; applications?: number; error?: string }> {
        try {
            const response = await fetch(`${this.NAUKRI_API_BASE}/jobpostings/v2/status/${jobId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
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
                error: error.message
            };
        }
    }

    /**
     * Update job on Naukri
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
                'full-time': 'Full Time',
                'part-time': 'Part Time',
                'contract': 'Contract',
                'temporary': 'Temporary',
                'intern': 'Internship',
                'freelance': 'Freelance',
            };

            const naukriEmploymentType = employmentTypeMap[jobData.employmentType?.toLowerCase()] || 'Full Time';

            const response = await fetch(`${this.NAUKRI_API_BASE}/jobpostings/v2/update/${jobId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
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
                error: error.message
            };
        }
    }

    /**
     * Delete job from Naukri
     */
    static async deleteJob(
        accessToken: string,
        jobId: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch(`${this.NAUKRI_API_BASE}/jobpostings/v2/delete/${jobId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete Naukri job');
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
}
