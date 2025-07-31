'use client';

import Login from '../../components/Login';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStytchMemberSession } from '@stytch/nextjs/b2b';

export default function AuthenticatePage() {
  const { session, isInitialized } = useStytchMemberSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const returnTo = searchParams.get('returnTo') || '/dashboard';

  // Redirect if the session exists
  useEffect(() => {
    if (isInitialized && session) {
      console.log('AuthenticatePage: Already logged in, redirecting to =', returnTo);
      router.replace(returnTo);
    }
  }, [isInitialized, session, router, returnTo]);

  // Don't render anything if already authenticated
  if (isInitialized && session) {
    return null;
  }

  // Don't render until we know authentication status
  if (!isInitialized) {
    return null;
  }

  console.log('AuthenticatePage: Rendering with returnTo =', returnTo);
  
  return <Login returnTo={returnTo} />;
}
