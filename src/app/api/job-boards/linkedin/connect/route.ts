import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { LinkedInOAuthService } from '@/services/linkedin-oauth.service';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const organizationId = searchParams.get('organization_id');
    const redirectUri = searchParams.get('redirect_uri');
    
    // Use redirect URI from query param, or construct from current origin, or use env var
    const finalRedirectUri = redirectUri || 
      `${req.nextUrl.origin}/api/job-boards/linkedin/callback` ||
      process.env.LINKEDIN_REDIRECT_URI;

    // Generate state token for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');
    
    // Store state in session/cookie (simplified - in production use proper session storage)
    const response = NextResponse.redirect(
      LinkedInOAuthService.getAuthorizationUrl(state, finalRedirectUri)
    );
    
    // Store state, userId, and redirect URI in cookie (must match exactly in token exchange)
    response.cookies.set('linkedin_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    });
    
    response.cookies.set('linkedin_oauth_user_id', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
    });

    // Store redirect URI so we can use the exact same one in token exchange
    response.cookies.set('linkedin_oauth_redirect_uri', finalRedirectUri, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
    });

    if (organizationId) {
      response.cookies.set('linkedin_oauth_org_id', organizationId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600,
      });
    }

    return response;
  } catch (error: any) {
    console.error('LinkedIn connect error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initiate LinkedIn connection' },
      { status: 500 }
    );
  }
}

