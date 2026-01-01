// services/linkedin-feed-post.service.ts
import { createClient } from '@supabase/supabase-js';

export class LinkedInFeedPostService {
    private static readonly LINKEDIN_API_BASE = 'https://api.linkedin.com';
    private static readonly LINKEDIN_VERSION = '202501';

    /**
     * Post a job announcement as a LinkedIn feed post
     * This uses the newer Posts API (/rest/posts) and works with w_member_social permission
     */
    static async postJobAsFeedPost(
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
        }
    ): Promise<{ success: boolean; shareId?: string; shareUrl?: string; error?: string }> {
        try {
            // 1. Get Person URN
            // Try OIDC userinfo first (most reliable with openid scope)
            let personUrn = '';
            
            try {
                const userinfoResponse = await fetch(`${this.LINKEDIN_API_BASE}/v2/userinfo`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                if (userinfoResponse.ok) {
                    const userInfo = await userinfoResponse.json();
                    if (userInfo.sub) {
                        personUrn = `urn:li:person:${userInfo.sub}`;
                    }
                }
            } catch (e) {
                console.warn('Failed to fetch userinfo for URN, trying fallback:', e);
            }

            // Fallback to /v2/me if userinfo failed
            if (!personUrn) {
                const meResponse = await fetch(`${this.LINKEDIN_API_BASE}/v2/me`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                if (meResponse.ok) {
                    const meData = await meResponse.json();
                    personUrn = `urn:li:person:${meData.id}`;
                } else {
                    const errorText = await meResponse.text();
                    console.error('LinkedIn /v2/me error:', errorText);
                    throw new Error('Could not retrieve LinkedIn User ID. Please ensure "openid" or "profile" scope is authorized.');
                }
            }

            console.log('Posting to LinkedIn as:', personUrn);

            // 2. Prepare Post Content
            const feedText = this.createJobFeedPost(jobData);

            // 3. Create Post using /rest/posts
            const postPayload = {
                author: personUrn,
                commentary: feedText,
                visibility: "PUBLIC",
                distribution: {
                    feedDistribution: "MAIN_FEED",
                    targetEntities: [],
                    thirdPartyDistributionChannels: []
                },
                content: {
                    article: {
                        source: jobData.applyUrl,
                        title: `We're Hiring: ${jobData.title}`,
                        description: `Apply now for the ${jobData.title} position at ${jobData.companyName || 'our company'}.`,
                        // thumbnail: 'urn:li:image:...' // We could add a thumbnail URN if we uploaded an image first
                    }
                },
                lifecycleState: "PUBLISHED",
                isReshareDisabledByAuthor: false
            };

            const response = await fetch(`${this.LINKEDIN_API_BASE}/rest/posts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'X-Restli-Protocol-Version': '2.0.0',
                    'LinkedIn-Version': this.LINKEDIN_VERSION
                },
                body: JSON.stringify(postPayload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                // Check specifically for permissions or duplicate content errors
                console.error('LinkedIn /rest/posts error:', errorText);
                throw new Error(`LinkedIn Posting Failed: ${response.status} ${response.statusText}`);
            }

            // The ID of the created post is in the x-restli-id header
            // Format: urn:li:share:123 or urn:li:ugcPost:123
            const createdUrn = response.headers.get('x-restli-id');
            // Extract numeric ID for simple URL construction if possible, or just use the URN
            // New post URLs are often linkedin.com/feed/update/<urn>
            
            console.log('LinkedIn Post Created URN:', createdUrn);

            return {
                success: true,
                shareId: createdUrn || 'unknown',
                shareUrl: createdUrn ? `https://www.linkedin.com/feed/update/${createdUrn}` : undefined,
            };

        } catch (error: any) {
            console.error('LinkedIn feed post error:', error);
            
            if (error.message.includes('403') || error.message.includes('permission')) {
                return {
                    success: false,
                    error: 'Permission denied. Ensure your LinkedIn connection allows posting (w_member_social).'
                };
            }
            if (error.message.includes('401')) {
                return {
                    success: false,
                    error: 'Access token expired or invalid. Please reconnect LinkedIn.'
                };
            }
            
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Create a job announcement text for LinkedIn feed post
     */
    private static createJobFeedPost(jobData: {
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
    }): string {
        const lines = [];
        
        // Add emoji and title
        lines.push(`🚀 We're hiring a ${jobData.title}`);
        
        // Add location
        if (jobData.location) {
            lines.push(`📍 ${jobData.location}`);
        }
        
        // Add employment type
        if (jobData.employmentType) {
            const typeEmoji = this.getEmploymentTypeEmoji(jobData.employmentType);
            lines.push(`${typeEmoji} ${this.formatEmploymentType(jobData.employmentType)}`);
        }
        
        // Add salary if available
        if (jobData.salaryRange) {
            lines.push(`💰 ${this.formatSalary(jobData.salaryRange)}`);
        }
        
        // Add company name if available
        if (jobData.companyName) {
            lines.push(`🏢 ${jobData.companyName}`);
        }
        
        // Add call to action
        lines.push(`👉 Apply here: ${jobData.applyUrl}`);
        
        // Add hashtags
        lines.push('');
        lines.push(`#hiring #jobs #${jobData.title.replace(/\s+/g, '').toLowerCase()} #careers`);
        
        return lines.join('\n');
    }

    /**
     * Get emoji for employment type
     */
    private static getEmploymentTypeEmoji(employmentType: string): string {
        const typeMap: Record<string, string> = {
            'full-time': '💼',
            'part-time': '⏰',
            'contract': '📄',
            'temporary': '⏳',
            'intern': '🎓',
            'freelance': '🌐',
        };
        return typeMap[employmentType.toLowerCase()] || '💼';
    }

    /**
     * Format employment type for display
     */
    private static formatEmploymentType(employmentType: string): string {
        const typeMap: Record<string, string> = {
            'full-time': 'Full-time',
            'part-time': 'Part-time',
            'contract': 'Contract',
            'temporary': 'Temporary',
            'intern': 'Internship',
            'freelance': 'Freelance',
        };
        return typeMap[employmentType.toLowerCase()] || employmentType;
    }

    /**
     * Format salary range for display
     */
    private static formatSalary(salaryRange: {
        min: number;
        max: number;
        currency: string;
    }): string {
        const { min, max, currency } = salaryRange;
        const currencySymbol = this.getCurrencySymbol(currency);
        
        if (min === max) {
            return `${currencySymbol}${min.toLocaleString()}`;
        }
        
        return `${currencySymbol}${min.toLocaleString()} - ${currencySymbol}${max.toLocaleString()}`;
    }

    /**
     * Get currency symbol
     */
    private static getCurrencySymbol(currency: string): string {
        const symbolMap: Record<string, string> = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'INR': '₹',
            'JPY': '¥',
        };
        return symbolMap[currency] || currency;
    }

    /**
     * Get LinkedIn share status
     * Note: /rest/posts does not supply a direct status text like 'READY', 
     * but we can check if it exists or fetch engagement data.
     */
    static async getShareStatus(
        accessToken: string,
        shareUrn: string
    ): Promise<{ success: boolean; status?: string; views?: number; error?: string }> {
        try {
            // Encode the URN for the URL path
            const encodedUrn = encodeURIComponent(shareUrn);
            const response = await fetch(`${this.LINKEDIN_API_BASE}/rest/posts/${encodedUrn}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Restli-Protocol-Version': '2.0.0',
                    'LinkedIn-Version': this.LINKEDIN_VERSION
                },
            });

            if (!response.ok) {
                throw new Error('Failed to get LinkedIn post status');
            }

            const data = await response.json();
            
            return {
                success: true,
                status: data.lifecycleState, // e.g. 'PUBLISHED'
                views: 0, // Views are not directly in the simple GET response for posts, requires analytics API
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to get LinkedIn post status'
            };
        }
    }

    /**
     * Delete LinkedIn share/post
     */
    static async deleteShare(
        accessToken: string,
        shareUrn: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const encodedUrn = encodeURIComponent(shareUrn);
            const response = await fetch(`${this.LINKEDIN_API_BASE}/rest/posts/${encodedUrn}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Restli-Protocol-Version': '2.0.0',
                    'LinkedIn-Version': this.LINKEDIN_VERSION
                },
            });

            if (!response.ok) {
                // 404 means it's already gone, which is fine
                if (response.status !== 404) {
                     throw new Error('Failed to delete LinkedIn post');
                }
            }

            return { success: true };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to delete LinkedIn post'
            };
        }
    }
}
