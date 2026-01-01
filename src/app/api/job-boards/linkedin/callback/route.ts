import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { LinkedInOAuthService } from '@/services/linkedin-oauth.service';
import { JobBoardIntegrationService } from '@/services/job-board-integration.service';

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Check for OAuth errors
    if (error) {
      return NextResponse.redirect(
        new URL(`/dashboard?error=${encodeURIComponent(errorDescription || error)}`, req.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard?error=missing_code_or_state', req.url)
      );
    }

    // Verify state token
    const storedState = req.cookies.get('linkedin_oauth_state')?.value;
    const storedUserId = req.cookies.get('linkedin_oauth_user_id')?.value;
    const storedRedirectUri = req.cookies.get('linkedin_oauth_redirect_uri')?.value;
    const organizationId = req.cookies.get('linkedin_oauth_org_id')?.value;

    if (!storedState || storedState !== state) {
      return NextResponse.redirect(
        new URL('/dashboard?error=invalid_state', req.url)
      );
    }

    if (storedUserId !== userId) {
      return NextResponse.redirect(
        new URL('/dashboard?error=user_mismatch', req.url)
      );
    }

    // Use the exact same redirect URI that was used in authorization
    // This is critical - LinkedIn requires exact match
    const redirectUri = storedRedirectUri || 
      `${req.nextUrl.origin}/api/job-boards/linkedin/callback` ||
      process.env.LINKEDIN_REDIRECT_URI;

    if (!redirectUri) {
      return NextResponse.redirect(
        new URL('/dashboard?error=redirect_uri_not_configured', req.url)
      );
    }

    let tokenResponse;
    let userInfo;
    
    try {
      // Exchange code for token - MUST use same redirect URI as authorization
      tokenResponse = await LinkedInOAuthService.exchangeCodeForToken(code, redirectUri);
    } catch (error: any) {
      console.error('Token exchange error:', error);
      return NextResponse.redirect(
        new URL(`/dashboard?error=${encodeURIComponent(error.message || 'token_exchange_failed')}`, req.url)
      );
    }
    
    try {
      // Get user info
      userInfo = await LinkedInOAuthService.getUserInfo(tokenResponse.access_token);
    } catch (error: any) {
      console.error('User info fetch error:', error);
      // If token exchange succeeded but user info fails, we can still save the integration
      // with minimal info
      userInfo = {
        id: 'unknown',
        firstName: '',
        lastName: '',
        email: undefined,
        profilePicture: undefined,
      };
    }

    // Save integration
    await JobBoardIntegrationService.upsertIntegration({
      user_id: userId,
      organization_id: organizationId || undefined,
      platform: 'linkedin',
      access_token: tokenResponse.access_token,
      refresh_token: tokenResponse.refresh_token,
      token_expires_at: LinkedInOAuthService.calculateExpirationDate(
        tokenResponse.expires_in
      ),
      platform_user_id: userInfo.id,
      platform_email: userInfo.email,
      platform_name: `${userInfo.firstName} ${userInfo.lastName}`,
    });

    // Clear cookies
    const response = NextResponse.redirect(new URL('/dashboard?linkedin_connected=true', req.url));
    response.cookies.delete('linkedin_oauth_state');
    response.cookies.delete('linkedin_oauth_user_id');
    response.cookies.delete('linkedin_oauth_org_id');
    response.cookies.delete('linkedin_oauth_redirect_uri');

    return response;
  } catch (error: any) {
    console.error('LinkedIn callback error:', error);
    return NextResponse.redirect(
      new URL(`/dashboard?error=${encodeURIComponent(error.message || 'connection_failed')}`, req.url)
    );
  }
}

