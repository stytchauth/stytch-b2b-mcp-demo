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

/*
 * Login configures and renders the StytchLogin component which is a prebuilt UI component for auth powered by Stytch.
 *
 * This component accepts style, config, and callbacks props. To learn more about possible options review the documentation at
 * https://stytch.com/docs/b2b/sdks/ui-config
 */

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
              console.log('Login: Auth complete, returnTo =', returnTo);
              router.replace(returnTo || '/dashboard');
            }
          },
        }}
      />
    </PageLayout>
  );
};

export default Login;
