import { NextRequest, NextResponse } from 'next/server';
import { parseConnectionContextCookie } from '@/lib/connectionConfig';

export const runtime = 'nodejs';

function getRequestOrigin(request: NextRequest): string {
  const host = request.headers.get('host');
  if (!host) {
    return request.nextUrl.origin;
  }
  const protocol = request.nextUrl.protocol || 'http:';
  return `${protocol}//${host}`;
}

function redirect(request: NextRequest, path: string): NextResponse {
  const origin = getRequestOrigin(request);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return NextResponse.redirect(`${origin}${normalizedPath}`);
}

function clearOauthCookies(response: NextResponse) {
  response.cookies.set('oauth_state', '', { path: '/', maxAge: 0 });
  response.cookies.set('oauth_code_verifier', '', { path: '/', maxAge: 0 });
  response.cookies.set('oauth_connection_context', '', { path: '/', maxAge: 0 });
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const origin = getRequestOrigin(request);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code || !state) {
    const res = redirect(request, '/connections?error=missing_params');
    clearOauthCookies(res);
    return res;
  }

  const storedState = request.cookies.get('oauth_state')?.value;
  if (!storedState || storedState !== state) {
    const res = redirect(request, '/connections?error=state_mismatch');
    clearOauthCookies(res);
    return res;
  }

  const context = parseConnectionContextCookie(
    request.cookies.get('oauth_connection_context')?.value
  );

  if (!context) {
    const res = redirect(
      request,
      '/connections?error=missing_connection_context'
    );
    clearOauthCookies(res);
    return res;
  }

  const { slug, clientId, tokenEndpoint } = context;

  if (!slug || !clientId || !tokenEndpoint) {
    const res = redirect(request, '/connections?error=missing_connection_details');
    clearOauthCookies(res);
    return res;
  }

  const codeVerifier = request.cookies.get('oauth_code_verifier')?.value;
  if (!codeVerifier) {
    const res = redirect(request, '/connections?error=missing_code_verifier');
    clearOauthCookies(res);
    return res;
  }

  const accessTokenCookieName =
    context.accessTokenCookieName ?? `${slug}_access_token`;
  const successQueryValue =
    context.successQueryValue ?? `${slug}_connected`;

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: context.redirectUri ?? `${origin}/connections/callback`,
    client_id: clientId,
    code_verifier: codeVerifier,
  });

  try {
    const tokenRes = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      console.error('Token exchange failed', {
        status: tokenRes.status,
        statusText: tokenRes.statusText,
        bodyPreview: errorText.slice(0, 1024),
      });
      const res = redirect(request, '/connections?error=token_exchange_failed');
      clearOauthCookies(res);
      res.cookies.set(accessTokenCookieName, '', { path: '/', maxAge: 0 });
      return res;
    }

    const tokens = await tokenRes.json();
    const res = redirect(request, `/connections?success=${encodeURIComponent(successQueryValue)}`);

    if (tokens.access_token) {
      res.cookies.set(accessTokenCookieName, tokens.access_token, {
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
        secure: url.protocol === 'https:',
        maxAge:
          typeof tokens.expires_in === 'number' ? tokens.expires_in : 3600,
      });
    }

    clearOauthCookies(res);
    return res;
  } catch (error) {
    console.error('Token exchange error', error);
    const res = redirect(request, '/connections?error=token_exchange_failed');
    clearOauthCookies(res);
    res.cookies.set(accessTokenCookieName, '', { path: '/', maxAge: 0 });
    return res;
  }
}