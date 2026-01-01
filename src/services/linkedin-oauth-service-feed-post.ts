// Update LinkedIn OAuth service to use feed post approach
import { createClient } from '@supabase/supabase-js';

export class LinkedInOAuthService {
  private static readonly LINKEDIN_CLIENT_ID = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || '866hyjtgc1o36p';
  private static readonly LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET || '';
  private static readonly LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/api/job-boards/linkedin/callback';

  /**
   * Get LinkedIn OAuth URL with feed post permissions
   */
  static getAuthUrl(userId: string, redirect?: string): string {
    const scopes = [
      'openid',
      'profile',
      'email',
      'w_member_social', // Post content as user (for feed posts)
      // Note: We don't need w_organization_social for feed posts
    ].join(' ');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.LINKEDIN_CLIENT_ID,
      redirect_uri: redirect || this.LINKEDIN_REDIRECT_URI,
      state: userId,
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
  ): Promise<{ access_token: string; expires_in: number; refresh_token?: string }> {
    const redirect = redirectUri || this.LINKEDIN_REDIRECT_URI;

    if (!this.LINKEDIN_CLIENT_SECRET) {
      throw new Error('LinkedIn client secret is not configured');
    }

    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirect,
        client_id: this.LINKEDIN_CLIENT_ID,
        client_secret: this.LINKEDIN_CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange LinkedIn authorization code');
    }

    return response.json();
  }

  /**
   * Get user info from LinkedIn
   */
  static async getUserInfo(accessToken: string): Promise<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
  }> {
    try {
      // Get user info from OpenID Connect
      const response = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get LinkedIn user info');
      }

      const openIdData = await response.json();

      // Also get profile info (optional - if it fails, we still have OpenID data)
      let profileData: any = {};
      try {
        const profileResponse = await fetch(
          'https://api.linkedin.com/v2/people/~:(id,firstName,lastName,profilePicture(displayImage~:playableStreams))',
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
      console.error('LinkedIn user info error:', error);
      throw new Error('Failed to get LinkedIn user information');
    }
  }

  /**
   * Check if access token is expired
   */
  static isTokenExpired(tokenExpiresAt: string): boolean {
    return new Date() > new Date(tokenExpiresAt);
  }

  /**
   * Calculate token expiration date
   */
  static calculateExpirationDate(expiresIn: number): string {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresIn * 1000);
    return expiresAt.toISOString();
  }

  /**
   * Store LinkedIn integration (feed post approach)
   */
  static async storeIntegration(data: {
    userId: string;
    organizationId?: string;
    accessToken: string;
    refreshToken?: string;
    tokenExpiresAt: string;
    userInfo: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }): Promise<void> {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const integrationData = {
      user_id: data.userId,
      organization_id: data.organizationId || null,
      platform: 'linkedin',
      status: 'connected',
      access_token: data.accessToken,
      refresh_token: data.refreshToken || null,
      token_expires_at: data.tokenExpiresAt,
      platform_user_id: data.userInfo.id,
      platform_email: data.userInfo.email,
      platform_name: `${data.userInfo.firstName} ${data.userInfo.lastName}`,
      is_active: true,
      configuration: {},
    };

    const { error } = await supabase
      .from('job_board_integrations')
      .upsert(integrationData, {
        onConflict: 'user_id,platform'
      });

    if (error) {
      throw new Error(`Failed to store LinkedIn integration: ${error.message}`);
    }
  }

  /**
   * Get LinkedIn integration
   */
  static async getIntegration(userId: string): Promise<any> {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('job_board_integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', 'linkedin')
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to get LinkedIn integration: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete LinkedIn integration
   */
  static async deleteIntegration(userId: string): Promise<void> {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from('job_board_integrations')
      .delete()
      .eq('user_id', userId)
      .eq('platform', 'linkedin');

    if (error) {
      throw new Error(`Failed to delete LinkedIn integration: ${error.message}`);
    }
  }

  /**
   * Refresh LinkedIn access token
   */
  static async refreshToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
    if (!this.LINKEDIN_CLIENT_SECRET) {
      throw new Error('LinkedIn client secret is not configured');
    }

    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refreshToken,
        client_id: this.LINKEDIN_CLIENT_ID,
        client_secret: this.LINKEDIN_CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh LinkedIn access token');
    }

    return response.json();
  }

  /**
   * Update LinkedIn integration status
   */
  static async updateIntegrationStatus(
    userId: string,
    status: 'connected' | 'disconnected' | 'expired' | 'error',
    error?: string
  ): Promise<void> {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const updateData: any = {
      status,
    };

    if (error) {
      updateData.last_error = error;
      updateData.last_error_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('job_board_integrations')
      .update(updateData)
      .eq('user_id', userId)
      .eq('platform', 'linkedin');

    if (updateError) {
      throw new Error(`Failed to update LinkedIn integration: ${updateError.message}`);
    }
  }
}
