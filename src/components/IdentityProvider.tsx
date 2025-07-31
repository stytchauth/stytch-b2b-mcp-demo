'use client';

import { B2BIdentityProvider as BaseB2BIdentityProvider } from '@stytch/nextjs/b2b';
import { StyleConfig } from '@stytch/vanilla-js';

const styles = {
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', system-ui, sans-serif",
  container: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
    borderRadius: '16px',
  },
  colors: {
    primary: '#2d2d2d',
    secondary: '#787774',
    success: '#22c55e',
    error: '#f56565',
  },
  buttons: {
    primary: {
      backgroundColor: '#2d2d2d',
      textColor: '#ffffff',
      borderColor: '#2d2d2d',
      borderRadius: '8px',
    },
    secondary: {
      backgroundColor: '#ffffff',
      textColor: '#2d2d2d',
      borderColor: '#e9e9e7',
      borderRadius: '8px',
    },
  },
  inputs: {
    backgroundColor: '#ffffff',
    textColor: '#2d2d2d',
    placeholderColor: '#9b9a97',
    borderColor: '#e9e9e7',
    borderRadius: '8px',
  },
} satisfies StyleConfig;

// The B2BIdentityProvider handles OAuth authorization flow for B2B applications
// It reads from the stytch_session cookie and handles the OAuth consent flow
export function IdentityProvider() {
  return <BaseB2BIdentityProvider styles={styles} />;
}
