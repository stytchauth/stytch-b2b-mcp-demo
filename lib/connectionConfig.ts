export type ConnectionSlug = 'hellosocks';

export interface ResolvedConnectionConfig {
  slug: ConnectionSlug | string;
  displayName: string;
  clientId?: string;
  authorizationEndpoint?: string;
  redirectUri?: string;
  scope?: string;
  issuer?: string;
  tokenEndpoint?: string;
  metadataUrl?: string;
  userInfoUrl?: string;
  accessTokenCookieName: string;
  successQueryValue: string;
}

const HELLOSOCKS_CONNECTION: ResolvedConnectionConfig = {
  slug: 'hellosocks',
  displayName: 'Hello Socks',
  clientId: 'connected-app-live-5ca2c7e1-db7d-4c7b-a47a-1d42e6f7e7d0',
  authorizationEndpoint: 'https://www.shophellosocks.com/oauth/authorize',
  redirectUri: 'http://127.0.0.1:3000/connections/callback',
  scope: 'openid profile email',
  issuer: 'https://login.hellosocksagentdemo.com',
  tokenEndpoint: 'https://login.hellosocksagentdemo.com/v1/oauth2/token',
  metadataUrl: 'https://login.hellosocksagentdemo.com/.well-known/openid-configuration',
  userInfoUrl: 'https://login.hellosocksagentdemo.com/v1/oauth2/userinfo',
  accessTokenCookieName: 'hellosocks_access_token',
  successQueryValue: 'hellosocks_connected',
};

export function resolveConnectionConfig(
  slug: ConnectionSlug | string,
  _options: { publicOnly?: boolean } = {}
): ResolvedConnectionConfig | null {
  if (slug === 'hellosocks') {
    return { ...HELLOSOCKS_CONNECTION };
  }
  return null;
}

export function getKnownConnectionSlugs(): ConnectionSlug[] {
  return ['hellosocks'];
}

export interface ConnectionContextCookie {
  slug: string;
  clientId?: string;
  tokenEndpoint?: string;
  issuer?: string;
  metadataUrl?: string;
  accessTokenCookieName?: string;
  successQueryValue?: string;
  userInfoUrl?: string;
  redirectUri?: string;
}

export function parseConnectionContextCookie(raw: string | undefined): ConnectionContextCookie | null {
  if (!raw) {
    return null;
  }

  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded) as ConnectionContextCookie;
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    return parsed;
  } catch (error) {
    console.warn('Failed to parse oauth_connection_context cookie', error);
    return null;
  }
}

export function serializeConnectionContextCookie(context: ConnectionContextCookie): string {
  return encodeURIComponent(JSON.stringify(context));
}

