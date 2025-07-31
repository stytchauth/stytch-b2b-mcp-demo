'use client';

import { AppSidebar } from '../../components/app-sidebar';
import { SidebarTrigger } from '../../components/ui/sidebar';
import { useStytchMemberSession } from '@stytch/nextjs/b2b';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import Image from 'next/image';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import {
  resolveConnectionConfig,
  serializeConnectionContextCookie,
} from '@/lib/connectionConfig';

interface UserInfoResponse {
  email?: string;
}

interface CustomConnection {
  id: string;
  title: string;
  description: string;
  clientId: string;
  metadataUrl: string;
}

type CustomConnectionFormValues = Omit<CustomConnection, 'id'>;

interface ConnectionStatus {
  email: string | null;
  isLoading: boolean;
}

interface ConnectionDescriptor {
  slug: string;
  accessTokenCookieName: string;
  userInfoUrl?: string;
  metadataUrl?: string;
  successQueryValue: string;
}

interface StartConnectionOptions {
  slug: string;
  authorizationEndpoint?: string;
  clientId?: string;
  redirectUri?: string;
  scope?: string;
  issuer?: string;
  tokenEndpoint?: string;
  metadataUrl?: string;
  userInfoUrl?: string;
  successQueryValue?: string;
  accessTokenCookieName?: string;
}

const HELLOSOCKS_SLUG = 'hellosocks';
const helloSocksConfig = resolveConnectionConfig(HELLOSOCKS_SLUG, { publicOnly: true });
const helloSocksAccessTokenCookie =
  helloSocksConfig?.accessTokenCookieName ?? 'hellosocks_access_token';
const helloSocksUserInfoUrl =
  helloSocksConfig?.userInfoUrl ??
  'https://www.hellosocksagentdemo.com/oauth/userinfo';

const sanitize = (value?: string | null): string | undefined => {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const getCookieValue = (name: string): string | null => {
  if (typeof document === 'undefined') {
    return null;
  }

  const rawCookie = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${name}=`));

  if (!rawCookie) {
    return null;
  }

  const value = rawCookie.slice(rawCookie.indexOf('=') + 1);
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const cookieSuffix = () => (typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '');

const clearCookie = (name: string) => {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${cookieSuffix()}`;
};

const setTemporaryCookie = (name: string, value: string) => {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${name}=${value}; Max-Age=300; Path=/; SameSite=Lax${cookieSuffix()}`;
};

const base64UrlEncode = (buffer: ArrayBuffer | Uint8Array) => {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const getRandomBytes = (length: number) => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array;
};

const createCodeVerifier = () => base64UrlEncode(getRandomBytes(32));

const createStateNonce = () => base64UrlEncode(getRandomBytes(18));

const createCodeChallenge = async (codeVerifier: string) => {
  const encoder = new TextEncoder();
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(codeVerifier));
  return base64UrlEncode(digest);
};

const normalizeIssuer = (value?: string | null) =>
  value ? value.replace(/\/+$/, '') : undefined;

interface OpenIdMetadata {
  authorizationEndpoint?: string;
  tokenEndpoint?: string;
  userInfoEndpoint?: string;
  issuer?: string;
}

const loadOpenIdMetadata = async (metadataUrl?: string): Promise<OpenIdMetadata> => {
  if (!metadataUrl) {
    return {};
  }

  try {
    const response = await fetch(metadataUrl);
    if (!response.ok) {
      console.warn('Failed to fetch OpenID metadata', {
        metadataUrl,
        status: response.status,
        statusText: response.statusText,
      });
      return {};
    }

    const data = await response.json();
    if (typeof data !== 'object' || !data) {
      return {};
    }

    const metadata = data as Record<string, unknown>;
    return {
      authorizationEndpoint:
        typeof metadata.authorization_endpoint === 'string' ? metadata.authorization_endpoint : undefined,
      tokenEndpoint: typeof metadata.token_endpoint === 'string' ? metadata.token_endpoint : undefined,
      userInfoEndpoint:
        typeof metadata.userinfo_endpoint === 'string' ? metadata.userinfo_endpoint : undefined,
      issuer: typeof metadata.issuer === 'string' ? metadata.issuer : undefined,
    };
  } catch (error) {
    console.warn('Failed to fetch OpenID metadata', { metadataUrl, error });
    return {};
  }
};

const fetchConnectionEmail = async (descriptor: ConnectionDescriptor) => {
  const accessToken = getCookieValue(descriptor.accessTokenCookieName);
  if (!accessToken) {
    return null;
  }

  let userInfoUrl = descriptor.userInfoUrl;

  if (!userInfoUrl && descriptor.metadataUrl) {
    const metadata = await loadOpenIdMetadata(descriptor.metadataUrl);
    userInfoUrl = metadata.userInfoEndpoint;
  }

  if (!userInfoUrl) {
    return null;
  }

  try {
    const response = await fetch(userInfoUrl, {
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.warn('User info request failed', {
        slug: descriptor.slug,
        userInfoUrl,
        status: response.status,
        statusText: response.statusText,
      });
      return null;
    }

    const data = (await response.json()) as UserInfoResponse;
    return data.email ?? null;
  } catch (error) {
    console.warn('Failed to fetch user info', { slug: descriptor.slug, userInfoUrl, error });
    return null;
  }
};

const startConnectionOauth = async (options: StartConnectionOptions) => {
  const { slug } = options;
  const resolvedConfig = resolveConnectionConfig(slug, { publicOnly: true });

  const clientId = sanitize(options.clientId) ?? resolvedConfig?.clientId;
  if (!clientId) {
    throw new Error(`Missing client ID for connection "${slug}"`);
  }

  const accessTokenCookieName =
    sanitize(options.accessTokenCookieName) ??
    resolvedConfig?.accessTokenCookieName ??
    `${slug}_access_token`;

  const metadataUrl = sanitize(options.metadataUrl) ?? resolvedConfig?.metadataUrl;
  const scope = sanitize(options.scope) ?? resolvedConfig?.scope ?? 'openid profile email';

  const authorizationOverride = sanitize(options.authorizationEndpoint) ?? resolvedConfig?.authorizationEndpoint;
  const tokenOverride = sanitize(options.tokenEndpoint) ?? resolvedConfig?.tokenEndpoint;
  const userInfoOverride = sanitize(options.userInfoUrl) ?? resolvedConfig?.userInfoUrl;
  const issuerOverride = sanitize(options.issuer) ?? resolvedConfig?.issuer;

  const metadata = await loadOpenIdMetadata(metadataUrl);

  const authorizationEndpoint =
    authorizationOverride ?? metadata.authorizationEndpoint;
  if (!authorizationEndpoint) {
    throw new Error(`Missing authorization endpoint for connection "${slug}"`);
  }

  const tokenEndpoint = tokenOverride ?? metadata.tokenEndpoint;
  if (!tokenEndpoint) {
    throw new Error(`Missing token endpoint for connection "${slug}"`);
  }

  const userInfoUrl = userInfoOverride ?? metadata.userInfoEndpoint;

  const issuer =
    normalizeIssuer(
      issuerOverride ??
        metadata.issuer ??
        (() => {
          try {
            return new URL(authorizationEndpoint).origin;
          } catch {
            return undefined;
          }
        })()
    ) ?? undefined;

  const redirectUri = (() => {
    const configured = sanitize(options.redirectUri) ?? resolvedConfig?.redirectUri;
    const fallback = `${window.location.origin}/connections/callback`;
    if (!configured) {
      return fallback;
    }

    try {
      const parsed = new URL(configured);
      if (parsed.origin === window.location.origin) {
        return configured;
      }
      console.warn('Configured redirect URI origin differs from current origin; using current origin instead.', {
        configuredRedirectUri: configured,
        currentOrigin: window.location.origin,
      });
    } catch {
      console.warn('Invalid configured redirect URI; using default.', {
        configuredRedirectUri: configured,
      });
    }

    return fallback;
  })();

  const successQueryValue =
    sanitize(options.successQueryValue) ?? resolvedConfig?.successQueryValue ?? slug;

  const codeVerifier = createCodeVerifier();
  const codeChallenge = await createCodeChallenge(codeVerifier);
  const state = `${slug}:${createStateNonce()}`;

  setTemporaryCookie('oauth_state', state);
  setTemporaryCookie('oauth_code_verifier', codeVerifier);

  const contextPayload = serializeConnectionContextCookie({
    slug,
    clientId,
    tokenEndpoint,
    issuer,
    metadataUrl,
    accessTokenCookieName,
    successQueryValue,
    userInfoUrl,
    redirectUri,
  });

  setTemporaryCookie('oauth_connection_context', contextPayload);

  const authUrl = new URL(authorizationEndpoint);
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', scope);
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');

  window.location.href = authUrl.toString();
};

export default function ConnectionsPage() {
  const { session, isInitialized } = useStytchMemberSession();
  const router = useRouter();
  const [loadingConnectionId, setLoadingConnectionId] = useState<string | null>(null);
  const [customConnections, setCustomConnections] = useState<CustomConnection[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hasHydratedCustomConnections, setHasHydratedCustomConnections] = useState(false);
  const [connectionStatuses, setConnectionStatuses] = useState<Record<string, ConnectionStatus>>({});

  const getEmptyFormValues = (): CustomConnectionFormValues => ({
    title: '',
    description: '',
    metadataUrl: '',
    clientId: '',
  });

  const [formValues, setFormValues] = useState<CustomConnectionFormValues>(getEmptyFormValues);

  const connectionDescriptors = useMemo(() => {
    const descriptors: ConnectionDescriptor[] = [
      {
        slug: HELLOSOCKS_SLUG,
        accessTokenCookieName: helloSocksAccessTokenCookie,
        userInfoUrl: helloSocksUserInfoUrl,
        metadataUrl: helloSocksConfig?.metadataUrl,
        successQueryValue: helloSocksConfig?.successQueryValue ?? HELLOSOCKS_SLUG,
      },
    ];

    customConnections.forEach((connection) => {
      descriptors.push({
        slug: connection.id,
        accessTokenCookieName: `${connection.id}_access_token`,
        metadataUrl: connection.metadataUrl,
        successQueryValue: connection.id,
      });
    });

    return descriptors;
  }, [customConnections]);

  const loadConnectionUserInfo = useCallback(
    async (descriptor: ConnectionDescriptor, showLoading = false) => {
      const { slug } = descriptor;

      if (showLoading) {
        setConnectionStatuses((prev) => ({
          ...prev,
          [slug]: {
            email: prev[slug]?.email ?? null,
            isLoading: true,
          },
        }));
      }

      const email = await fetchConnectionEmail(descriptor);

      setConnectionStatuses((prev) => ({
        ...prev,
        [slug]: {
          email,
          isLoading: false,
        },
      }));

      return email;
    },
    []
  );

  const disconnectConnection = useCallback((descriptor: ConnectionDescriptor) => {
    clearCookie(descriptor.accessTokenCookieName);
    setConnectionStatuses((prev) => ({
      ...prev,
      [descriptor.slug]: { email: null, isLoading: false },
    }));
  }, []);

  const beginConnection = useCallback(async (options: StartConnectionOptions) => {
    setLoadingConnectionId(options.slug);
    try {
      await startConnectionOauth(options);
    } finally {
      setLoadingConnectionId(null);
    }
  }, []);

  useEffect(() => {
    if (!isInitialized || !session || !hasHydratedCustomConnections) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const successValue = params.get('success');

    const run = async () => {
      if (successValue) {
        const matched = connectionDescriptors.find(
          (descriptor) => descriptor.successQueryValue === successValue
        );

        if (matched) {
          await loadConnectionUserInfo(matched, true);
        } else {
          console.warn('Received success query parameter for unknown connection', { successValue });
        }

        await Promise.all(
          connectionDescriptors
            .filter((descriptor) => descriptor.successQueryValue !== successValue)
            .map((descriptor) => loadConnectionUserInfo(descriptor))
        );

        params.delete('success');
        const newQuery = params.toString();
        const newUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ''}`;
        window.history.replaceState({}, '', newUrl);
        return;
      }

      await Promise.all(
        connectionDescriptors.map((descriptor) => loadConnectionUserInfo(descriptor))
      );
    };

    void run();
  }, [
    isInitialized,
    session,
    hasHydratedCustomConnections,
    connectionDescriptors,
    loadConnectionUserInfo,
  ]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('customConnections');
      if (stored) {
        const parsed = JSON.parse(stored) as CustomConnection[];
        const normalized = parsed.map((connection) => ({
          id: connection.id,
          title: connection.title,
          description: connection.description,
          clientId: connection.clientId,
          metadataUrl: connection.metadataUrl ?? '',
        }));
        setCustomConnections(normalized);
      }
    } catch (error) {
      console.error('Failed to parse custom connections from storage:', error);
    } finally {
      setHasHydratedCustomConnections(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydratedCustomConnections) {
      return;
    }

    window.localStorage.setItem('customConnections', JSON.stringify(customConnections));
  }, [customConnections, hasHydratedCustomConnections]);

  useEffect(() => {
    if (isInitialized && !session) {
      router.replace('/');
    }
  }, [isInitialized, session, router]);

  const showDialog = (connection?: CustomConnection) => {
    if (connection) {
      setEditingId(connection.id);
      setFormValues({
        title: connection.title,
        description: connection.description,
        metadataUrl: connection.metadataUrl,
        clientId: connection.clientId,
      });
    } else {
      setEditingId(null);
      setFormValues(getEmptyFormValues());
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormValues(getEmptyFormValues());
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed: CustomConnectionFormValues = {
      title: formValues.title.trim(),
      description: formValues.description.trim(),
      metadataUrl: formValues.metadataUrl.trim(),
      clientId: formValues.clientId.trim(),
    };

    if (!trimmed.title || !trimmed.clientId) {
      return;
    }

    if (!trimmed.metadataUrl) {
      window.alert('Provide a well-known metadata URL to configure the connection.');
      return;
    }

    if (editingId) {
      setCustomConnections((prev) =>
        prev.map((connection) =>
          connection.id === editingId
            ? {
                id: connection.id,
                title: trimmed.title,
                description: trimmed.description,
                metadataUrl: trimmed.metadataUrl,
                clientId: trimmed.clientId,
              }
            : connection
        )
      );
    } else {
      setCustomConnections((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          title: trimmed.title,
          description: trimmed.description,
          metadataUrl: trimmed.metadataUrl,
          clientId: trimmed.clientId,
        },
      ]);
    }

    closeDialog();
  };

  const handleDelete = () => {
    if (!editingId) {
      return;
    }

    const descriptor = connectionDescriptors.find((item) => item.slug === editingId);
    if (descriptor) {
      disconnectConnection(descriptor);
      setConnectionStatuses((prev) => {
        const { [descriptor.slug]: _removed, ...rest } = prev;
        return rest;
      });
    }

    setCustomConnections((prev) => prev.filter((connection) => connection.id !== editingId));
    closeDialog();
  };

  const handleInputChange = (field: keyof CustomConnectionFormValues, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleConnectClick = useCallback(
    (connection: CustomConnection) => {
      if (!connection.metadataUrl) {
        window.alert('Add a well-known metadata URL before connecting.');
        return;
      }

      void beginConnection({
        slug: connection.id,
        clientId: connection.clientId,
        metadataUrl: connection.metadataUrl,
      });
    },
    [beginConnection]
  );

  if (isInitialized && !session) {
    return null;
  }

  const helloSocksDescriptor = connectionDescriptors.find(
    (descriptor) => descriptor.slug === HELLOSOCKS_SLUG
  );
  const helloSocksStatus = connectionStatuses[HELLOSOCKS_SLUG];
  const helloSocksEmail = helloSocksStatus?.email ?? null;
  const helloSocksLoading = helloSocksStatus?.isLoading ?? false;

  return (
    <div className="flex h-full">
      <AppSidebar />
      <main className="flex-1 p-4 md:p-6">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <SidebarTrigger className="md:hidden mr-2" />
            <h1 className="text-2xl font-semibold">Connections</h1>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => showDialog()}
            aria-label="Add connection"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </header>

        <div className="max-w-4xl">
          <p className="mb-6 text-muted-foreground">
            Connect your organization to external tools and services to streamline your workflow.
          </p>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-white">
                    <Image
                      src="/hellosocks.webp"
                      alt="Hello Socks"
                      width={32}
                      height={32}
                      className="rounded object-contain"
                    />
                  </div>
                  <CardTitle className="text-lg">Hello Socks</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex h-full flex-col pt-0">
                <CardDescription className="mb-4">
                  Connect via OAuth to your Hello Socks account.
                </CardDescription>
                {helloSocksEmail ? (
                  <div className="mt-auto space-y-3">
                    <div className="text-sm text-muted-foreground">
                      Connected as{' '}
                      <span className="font-medium text-foreground">{helloSocksEmail}</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        if (helloSocksDescriptor) {
                          disconnectConnection(helloSocksDescriptor);
                        }
                      }}
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-auto w-full"
                    onClick={() => {
                      void beginConnection({ slug: HELLOSOCKS_SLUG });
                    }}
                    disabled={helloSocksLoading || loadingConnectionId === HELLOSOCKS_SLUG}
                  >
                    {helloSocksLoading || loadingConnectionId === HELLOSOCKS_SLUG ? 'Loading…' : 'Connect'}
                  </Button>
                )}
              </CardContent>
            </Card>

            {customConnections.map((connection) => {
              const descriptor = connectionDescriptors.find(
                (item) => item.slug === connection.id
              );
              const status = connectionStatuses[connection.id];
              const email = status?.email ?? null;
              const isConnectionLoading = status?.isLoading ?? false;
              const isConnecting = loadingConnectionId === connection.id;

              return (
                <Card
                  key={connection.id}
                  className="flex h-full flex-col transition-shadow hover:shadow-md"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-lg">{connection.title}</CardTitle>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => showDialog(connection)}
                        aria-label={`Edit ${connection.title}`}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex h-full flex-col pt-0">
                    {connection.description ? (
                      <CardDescription className="mb-4">{connection.description}</CardDescription>
                    ) : null}
                    {email ? (
                      <div className="mt-auto space-y-3">
                        <div className="text-sm text-muted-foreground">
                          Connected as{' '}
                          <span className="font-medium text-foreground">{email}</span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            if (descriptor) {
                              disconnectConnection(descriptor);
                            }
                          }}
                        >
                          Disconnect
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-auto w-full"
                        onClick={() => handleConnectClick(connection)}
                        disabled={isConnecting || isConnectionLoading}
                      >
                        {isConnecting || isConnectionLoading ? 'Loading…' : 'Connect'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit connection' : 'Add connection'}</DialogTitle>
            <DialogDescription>
              Provide the details of the connection you want to {editingId ? 'update' : 'create'}.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleFormSubmit}>
            <div className="space-y-2">
              <Label htmlFor="connection-title">Title</Label>
              <Input
                id="connection-title"
                value={formValues.title}
                onChange={(event) => handleInputChange('title', event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="connection-description">Description</Label>
              <Textarea
                id="connection-description"
                value={formValues.description}
                onChange={(event) => handleInputChange('description', event.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="connection-metadata-url">Well-known metadata URL</Label>
              <Input
                id="connection-metadata-url"
                type="url"
                value={formValues.metadataUrl}
                onChange={(event) => handleInputChange('metadataUrl', event.target.value)}
                required
                placeholder="https://example.com/.well-known/openid-configuration"
              />
              <p className="text-xs text-muted-foreground">
                We discover the authorization and token endpoints from this URL.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="connection-client-id">Client ID</Label>
              <Input
                id="connection-client-id"
                value={formValues.clientId}
                onChange={(event) => handleInputChange('clientId', event.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:gap-0 sm:space-x-2">
                {editingId ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="justify-between text-destructive hover:text-destructive focus-visible:ring-destructive sm:justify-start"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete connection
                  </Button>
                ) : (
                  <span />
                )}
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:gap-2">
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingId ? 'Save changes' : 'Create connection'}
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
