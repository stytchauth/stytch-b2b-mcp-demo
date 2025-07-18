'use client';

import Login from '../../components/Login';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStytchMemberSession } from '@stytch/nextjs/b2b';

export default function AuthenticatePage() {
  const { session, isInitialized } = useStytchMemberSession();
  const router = useRouter();

  const alreadyLoggedInRef = useRef<boolean>();
  useEffect(() => {
    if (isInitialized && alreadyLoggedInRef.current === undefined) {
      const hasSession = !!session;
      alreadyLoggedInRef.current = hasSession;

      if (hasSession) {
        // The user was already logged in, so we can redirect them immediately
        router.replace('/dashboard');
      }
    }
  }, [isInitialized, session, router]);

  // Show loading state while initializing
  if (!isInitialized) {
    return null;
  }

  return <Login />;
}
