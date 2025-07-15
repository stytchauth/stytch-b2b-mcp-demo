'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { StytchB2B } from '@stytch/nextjs/b2b';
import { StytchEventType } from '@stytch/vanilla-js';
import { discoveryConfig, discoveryStyles, customStrings } from '@/lib/stytchConfig';
import './Login.css';

/*
 * Login configures and renders the StytchLogin component which is a prebuilt UI component for auth powered by Stytch.
 *
 * This component accepts style, config, and callbacks props. To learn more about possible options review the documentation at
 * https://stytch.com/docs/b2b/sdks/ui-config
 */

const Login = () => {

  const router = useRouter();

  return (
    <div className="centered-login">
      <div className="login-container">
        <div className="notion-header">
          <h1 className="notion-title">Think it. Make it.</h1>
          <p className="notion-subtitle">Log in to your Notely account</p>
        </div>
        <StytchB2B
        config={discoveryConfig}
        styles={discoveryStyles}
        strings={customStrings}
        callbacks={{
          onEvent: (event) => {
            if (event.type === StytchEventType.AuthenticateFlowComplete) {
              router.replace('/dashboard');
            }
          },
        }}
        />
      </div>
    </div>
  );
};

export default Login;
