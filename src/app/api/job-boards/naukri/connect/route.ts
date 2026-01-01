import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { NaukriOAuthService } from '@/services/naukri-oauth.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const redirectUri = searchParams.get('redirect_uri');
    
    // Use redirect URI from query param, or construct from current origin, or use env var
    const finalRedirectUri = redirectUri || 
      `${req.nextUrl.origin}/api/job-boards/naukri/callback` ||
      process.env.NAUKRI_REDIRECT_URI || "";

    const authUrl = NaukriOAuthService.getAuthUrl(userId, finalRedirectUri);
    
    const response = NextResponse.redirect(authUrl);
    
    // Store redirect URI so we can use the exact same one in token exchange
    response.cookies.set('naukri_oauth_redirect_uri', finalRedirectUri, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    });

    return response;
  } catch (error: any) {
    console.error('Naukri connect error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initiate Naukri connection' },
      { status: 500 }
    );
  }
}
