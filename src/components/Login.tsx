'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { StytchB2B } from '@stytch/nextjs/b2b';
import { StytchEventType } from '@stytch/vanilla-js';
import {
  discoveryConfig,
  discoveryStyles,
  customStrings,
} from '@/lib/stytchConfig';
import PageLayout from './PageLayout';

interface LoginProps {
  returnTo?: string | null;
}

const Login = ({ returnTo = null }: LoginProps) => {
  const router = useRouter();

  // Build the discovery redirect URL with preserved query parameters
  const buildDiscoveryRedirectURL = () => {
    if (typeof window === 'undefined') return '/authenticate';

    const redirectParams = new URLSearchParams();
    if (returnTo) {
      redirectParams.set('returnTo', returnTo);
    }

    return `${window.location.origin}/authenticate?${redirectParams.toString()}`;
  };

  // Create dynamic config that includes returnTo in discovery redirect
  const dynamicConfig = {
    ...discoveryConfig,
    emailMagicLinksOptions: {
      discoveryRedirectURL: buildDiscoveryRedirectURL(),
    },
    oauthOptions: {
      ...discoveryConfig.oauthOptions,
      discoveryRedirectURL: buildDiscoveryRedirectURL(),
    },
  };

  return (
    <PageLayout
      title="Think it. Make it."
      subtitle="Log in to your Notely account"
    >
      <StytchB2B
        config={dynamicConfig}
        styles={discoveryStyles}
        strings={customStrings}
        callbacks={{
          onEvent: event => {
            if (event.type === StytchEventType.AuthenticateFlowComplete) {
              router.replace(returnTo || '/dashboard');
            }
          },
        }}
      />
    </PageLayout>
  );
};

export default Login;
