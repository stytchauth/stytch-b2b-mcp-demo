'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ConnectionsCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const params = new URLSearchParams(window.location.search);

    if (!params.has('code') && !params.has('error')) {
      router.replace('/connections?error=missing_params');
      return;
    }

    // Delegate the token exchange to the server-side route to avoid CORS issues
    const callbackUrl = `/api/connections/callback${window.location.search}`;
    window.location.replace(callbackUrl);
  }, [router]);

  return null;
}


