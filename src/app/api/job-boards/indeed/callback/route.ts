import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { IndeedOAuthService } from '@/services/indeed-oauth.service';
import { JobBoardIntegrationService } from '@/services/job-board-integration.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(`${req.nextUrl.origin}/settings/integrations?error=${error}`);
    }

    if (!code) {
      return NextResponse.redirect(`${req.nextUrl.origin}/settings/integrations?error=no_code`);
    }

    // Retrieve the redirect URI used in the initial request
    const redirectUriCookie = req.cookies.get('indeed_oauth_redirect_uri');
    const redirectUri = redirectUriCookie?.value || 
      `${req.nextUrl.origin}/api/job-boards/indeed/callback` ||
      process.env.INDEED_REDIRECT_URI || "";

    // Exchange code for token
    const tokenResponse = await IndeedOAuthService.exchangeCodeForToken(code, redirectUri);

    // Save integration
    await JobBoardIntegrationService.upsertIntegration({
      user_id: userId,
      // We don't have organization_id in cookie here easily unless we stored it like LinkedIn.
      // But typically we associate with the user. If needed we can fetch user's org.
      // For now, let's leave org_id undefined or fetch it if critical.
      // LinkedIn route stored it in cookie. Let's assume user context is enough for now or 
      // rely on the user->org implicit link in the Service logic if it exists.
      platform: 'indeed',
      access_token: tokenResponse.access_token,
      refresh_token: tokenResponse.refresh_token,
      token_expires_at: new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString(),
      platform_user_id: userId, // Indeed doesn't always return a user ID in the token response freely, usually just the token.
    });

    // Cleanup cookie
    const response = NextResponse.redirect(`${req.nextUrl.origin}/settings/integrations?success=indeed_connected`);
    response.cookies.delete('indeed_oauth_redirect_uri');

    return response;
  } catch (error: any) {
    console.error('Indeed callback error:', error);
    return NextResponse.redirect(`${req.nextUrl.origin}/settings/integrations?error=callback_failed`);
  }
}
