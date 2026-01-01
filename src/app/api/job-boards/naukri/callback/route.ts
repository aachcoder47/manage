import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { NaukriOAuthService } from '@/services/naukri-oauth.service';
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
    const redirectUriCookie = req.cookies.get('naukri_oauth_redirect_uri');
    const redirectUri = redirectUriCookie?.value || 
      `${req.nextUrl.origin}/api/job-boards/naukri/callback` ||
      process.env.NAUKRI_REDIRECT_URI || "";

    // Exchange code for token
    const tokenResponse = await NaukriOAuthService.exchangeCodeForToken(code, redirectUri);

    // Save integration
    await JobBoardIntegrationService.upsertIntegration({
      user_id: userId,
      platform: 'naukri',
      access_token: tokenResponse.access_token,
      refresh_token: tokenResponse.refresh_token,
      token_expires_at: new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString(),
      platform_user_id: userId,
      is_active: true,
    });

    // Cleanup cookie
    const response = NextResponse.redirect(`${req.nextUrl.origin}/settings/integrations?success=naukri_connected`);
    response.cookies.delete('naukri_oauth_redirect_uri');

    return response;
  } catch (error: any) {
    console.error('Naukri callback error:', error);
    return NextResponse.redirect(`${req.nextUrl.origin}/settings/integrations?error=callback_failed`);
  }
}
