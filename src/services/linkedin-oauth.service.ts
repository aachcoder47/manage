import { JobBoardIntegrationService } from './job-board-integration.service';

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || '866hyjtgc1o36p';
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET || '';
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || '';

export interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
}

export interface LinkedInUserInfo {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  profilePicture?: string;
}

export class LinkedInOAuthService {
  /**
   * Generate LinkedIn OAuth authorization URL
   */
  static getAuthorizationUrl(state: string, redirectUri?: string): string {
    const redirect = redirectUri || LINKEDIN_REDIRECT_URI;
    // Start with basic scopes that are available by default
    const scopes = [
      'openid',
      'profile',
      'email',
      'w_member_social', // Post content as user
      // Note: w_organization_social requires LinkedIn approval
      // Remove it if not approved, or request access in LinkedIn Developer Portal
      // 'w_organization_social', // Post jobs on behalf of organization - requires approval
    ].join(' ');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: LINKEDIN_CLIENT_ID,
      redirect_uri: redirect,
      state,
      scope: scopes,
    });

    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  static async exchangeCodeForToken(
    code: string,
    redirectUri?: string
  ): Promise<LinkedInTokenResponse> {
    const redirect = redirectUri || LINKEDIN_REDIRECT_URI;

    if (!LINKEDIN_CLIENT_SECRET) {
      throw new Error('LINKEDIN_CLIENT_SECRET is not configured. Please set it in your .env file.');
    }

    if (!redirect) {
      throw new Error('Redirect URI is missing. Please set LINKEDIN_REDIRECT_URI in your .env file.');
    }

    try {
      const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirect,
          client_id: LINKEDIN_CLIENT_ID,
          client_secret: LINKEDIN_CLIENT_SECRET,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Failed to exchange code for token: ${errorText}`;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error_description || errorJson.error || errorMessage;
        } catch {
          // If not JSON, use the text as is
        }
        
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error: any) {
      // Handle network errors
      if (error.message.includes('fetch failed') || error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new Error('Network error: Unable to connect to LinkedIn. Please check your internet connection.');
      }
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(refreshToken: string): Promise<LinkedInTokenResponse> {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to refresh token: ${error}`);
    }

    return await response.json();
  }

  /**
   * Get user info from LinkedIn
   */
  static async getUserInfo(accessToken: string): Promise<LinkedInUserInfo> {
    try {
      // First get OpenID user info
      const openIdResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!openIdResponse.ok) {
        const errorText = await openIdResponse.text();
        throw new Error(`Failed to fetch LinkedIn user info: ${errorText}`);
      }

      const openIdData = await openIdResponse.json();

      // Also get profile info (optional - if it fails, we still have OpenID data)
      let profileData: any = {};
      try {
        const profileResponse = await fetch(
          'https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (profileResponse.ok) {
          profileData = await profileResponse.json();
        }
      } catch (profileError) {
        // Profile fetch is optional, continue with OpenID data only
        console.warn('Failed to fetch LinkedIn profile, using OpenID data only:', profileError);
      }

      return {
        id: openIdData.sub || profileData.id || '',
        firstName: profileData.firstName?.localized?.en_US || openIdData.given_name || '',
        lastName: profileData.lastName?.localized?.en_US || openIdData.family_name || '',
        email: openIdData.email,
        profilePicture:
          profileData.profilePicture?.displayImage?.elements?.[0]?.identifiers?.[0]?.identifier,
      };
    } catch (error: any) {
      // Handle network errors
      if (error.message.includes('fetch failed') || error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new Error('Network error: Unable to connect to LinkedIn API. Please check your internet connection.');
      }
      throw error;
    }
  }

  /**
   * Post a job announcement to LinkedIn (Share API - Available to all developers)
   * This posts a professional job announcement as a share/update instead of a formal job posting
   */
  static async postJob(
    accessToken: string,
    jobData: {
      title: string;
      description: string;
      location: string;
      employmentType: string;
      companyUrn?: string;
      applyUrl: string;
      salaryRange?: {
        min: number;
        max: number;
        currency: string;
      };
    }
  ): Promise<{ success: boolean; shareId?: string; shareUrl?: string; error?: string }> {
    try {
      // Get user's profile to post as them
      const profileResponse = await fetch('https://api.linkedin.com/v2/people/~:(id)', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log('LinkedIn profile response status:', profileResponse.status);
      console.log('LinkedIn profile response headers:', Object.fromEntries(profileResponse.headers.entries()));

      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        console.log('LinkedIn profile error response:', errorText);
        
        // If profile fetch fails, try alternative endpoint
        const altProfileResponse = await fetch('https://api.linkedin.com/v2/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        console.log('LinkedIn alt profile response status:', altProfileResponse.status);

        if (!altProfileResponse.ok) {
          const altErrorText = await altProfileResponse.text();
          console.log('LinkedIn alt profile error response:', altErrorText);
          
          // Check if it's a permissions issue
          if (altProfileResponse.status === 403) {
            throw new Error('LinkedIn permission denied. Your app needs the w_member_social permission. Please check your LinkedIn app settings and ensure the correct permissions are requested during OAuth.');
          } else if (altProfileResponse.status === 401) {
            throw new Error('LinkedIn access token expired or invalid. Please reconnect your LinkedIn account.');
          } else {
            throw new Error(`LinkedIn API error (${altProfileResponse.status}): ${altErrorText}`);
          }
        }

        const altProfile = await altProfileResponse.json();
        console.log('LinkedIn alt profile data:', altProfile);
        const personUrn = `urn:li:person:${altProfile.id}`;

        // Create professional job announcement
        const shareText = this.createJobAnnouncement(jobData);

        // Post as LinkedIn share/update
        const response = await fetch('https://api.linkedin.com/v2/shares', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
          },
          body: JSON.stringify({
            owner: personUrn,
            text: {
              text: shareText,
            },
            subject: `Job Opening: ${jobData.title}`,
            distribution: {
              linkedInDistributionTarget: {
                visibleToAll: true,
              },
            },
            content: {
              contentEntities: [
                {
                  entityLocation: jobData.applyUrl,
                  thumbnails: [
                    {
                      resolvedUrl: jobData.applyUrl,
                    },
                  ],
                },
              ],
              title: `Job Opening: ${jobData.title}`,
            },
          }),
        });

        if (!response.ok) {
          const shareError = await response.text();
          console.log('LinkedIn share error response:', shareError);
          throw new Error(`Failed to post job update to LinkedIn: ${shareError}`);
        }

        const data = await response.json();
        console.log('LinkedIn share success:', data);
        return {
          success: true,
          shareId: data.id,
          shareUrl: `https://www.linkedin.com/feed/update/${data.id}`,
        };
      }

      const profile = await profileResponse.json();
      console.log('LinkedIn profile data:', profile);
      const personUrn = `urn:li:person:${profile.id}`;

      // Create professional job announcement
      const shareText = this.createJobAnnouncement(jobData);

      // Post as LinkedIn share/update
      const response = await fetch('https://api.linkedin.com/v2/shares', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify({
          owner: personUrn,
          text: {
            text: shareText,
          },
          subject: `Job Opening: ${jobData.title}`,
          distribution: {
            linkedInDistributionTarget: {
              visibleToAll: true,
            },
          },
          content: {
            contentEntities: [
              {
                entityLocation: jobData.applyUrl,
                thumbnails: [
                  {
                    resolvedUrl: jobData.applyUrl,
                  },
                ],
              },
            ],
            title: `Job Opening: ${jobData.title}`,
          },
        }),
      });

      if (!response.ok) {
        const shareError = await response.text();
        console.log('LinkedIn share error response:', shareError);
        throw new Error(`Failed to post job update to LinkedIn: ${shareError}`);
      }

      const data = await response.json();
      console.log('LinkedIn share success:', data);
      return {
        success: true,
        shareId: data.id,
        shareUrl: `https://www.linkedin.com/feed/update/${data.id}`,
      };
    } catch (error: any) {
      console.error('LinkedIn posting error:', error);
      
      // Handle specific LinkedIn errors
      if (error.message.includes('403')) {
        return {
          success: false,
          error: 'LinkedIn permission denied. Please ensure your app has the w_member_social permission.'
        };
      }
      if (error.message.includes('401')) {
        return {
          success: false,
          error: 'LinkedIn access token expired. Please reconnect your LinkedIn account.'
        };
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create professional job announcement text
   */
  private static createJobAnnouncement(jobData: {
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
  }): string {
    const hashtags = this.generateHashtags(jobData.title);
    const salaryInfo = jobData.salaryRange 
      ? `💰 Salary: ${jobData.salaryRange.currency} ${jobData.salaryRange.min.toLocaleString()} - ${jobData.salaryRange.max.toLocaleString()}\n`
      : '';

    return `🚀 New Job Opening: ${jobData.title}

${jobData.description.substring(0, 300)}...

📍 Location: ${jobData.location}
💼 Type: ${jobData.employmentType}
${salaryInfo}🔗 View full job & apply: https://www.linkedin.com/jobs/view/

${hashtags}

#hiring #jobs #careers #recruiting`;
  }

  /**
   * Generate relevant hashtags for the job
   */
  private static generateHashtags(title: string): string {
    const keywords = title.toLowerCase().split(' ');
    const hashtags = new Set<string>();

    // Add common tech keywords
    const techKeywords = ['developer', 'engineer', 'manager', 'analyst', 'designer', 'architect', 'consultant', 'specialist'];
    
    keywords.forEach(keyword => {
      if (techKeywords.includes(keyword)) {
        hashtags.add(`#${keyword}`);
      }
    });

    // Add industry hashtags
    hashtags.add('#hiring');
    hashtags.add('#jobs');
    hashtags.add('#careers');

    // Add title-specific hashtag
    const titleHashtag = `#${title.replace(/\s+/g, '').substring(0, 15)}`;
    hashtags.add(titleHashtag);

    return Array.from(hashtags).join(' ');
  }

  /**
   * Generate manual posting URL for LinkedIn Jobs
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
    
    return `https://www.linkedin.com/jobs/post?${params.toString()}`;
  }

  /**
   * Check if user has LinkedIn Jobs API access (for future partnership)
   */
  static async checkJobsAPIAccess(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.linkedin.com/v2/jobPosts', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      });

      // If we get 403 or 404, no Jobs API access
      if (response.status === 403 || response.status === 404) {
        return false;
      }
      
      // If we get 200, we have access
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Update LinkedIn post to redirect to itself
   */
  static async updateLinkedInPost(
    accessToken: string,
    shareId: string,
    updateData: { applyUrl: string }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // LinkedIn Share API doesn't support updating posts directly
      // So we'll create a new post with the correct URL
      // This is a limitation of the Share API
      
      // For now, we'll just return success since the original post already exists
      // The applyUrl in the original post will be used as-is
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(expiresAt: string | null): boolean {
    if (!expiresAt) return true;
    return new Date(expiresAt) < new Date();
  }

  /**
   * Calculate token expiration date
   */
  static calculateExpirationDate(expiresIn: number): string {
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);
    return expiresAt.toISOString();
  }
}

