'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStytchMemberSession } from '@stytch/nextjs/b2b';
import { IdentityProvider } from '@/components/IdentityProvider';
import PageLayout from '@/components/PageLayout';

export default function OAuthAuthorizationPage() {
  const { session, isInitialized } = useStytchMemberSession();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !session) {
      // User is not authenticated, redirect to login with return URL
      const currentPath = encodeURIComponent(
        window.location.pathname + window.location.search
      );
      router.push(`/authenticate?returnTo=${currentPath}`);
    }
  }, [isInitialized, session, router]);

  // Don't render anything if not authenticated
  if (isInitialized && !session) {
    return null;
  }

  // Don't render until we know authentication status
  if (!isInitialized) {
    return null;
  }

  return (
    <PageLayout
      title="Authorize Application"
      subtitle="Please authorize access to your Notely account"
    >
      <IdentityProvider />
    </PageLayout>
  );
}
