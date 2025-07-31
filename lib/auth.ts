import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import * as stytch from 'stytch';

const STYTCH_PROJECT_ID = process.env.STYTCH_PROJECT_ID;
const STYTCH_SECRET = process.env.STYTCH_SECRET;
const STYTCH_DOMAIN = process.env.STYTCH_DOMAIN;

export const client = new stytch.B2BClient({
  project_id: STYTCH_PROJECT_ID || '',
  secret: STYTCH_SECRET || '',
  custom_base_url: STYTCH_DOMAIN,
});

// Helper function to authenticate session and get user info
export async function authenticateSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("stytch_session");

  if (!sessionCookie) {
    throw new Error('No active session found');
  }

  let session;
  try {
    session = await client.sessions.authenticate({
      session_token: sessionCookie?.value,
    });
  } catch (error) {
    console.error('Session authentication error. Redirecting to login.');
    throw new Error('No active session found');
  }

  return session;
}

// Helper function to require authentication and redirect if not authenticated  
export async function requireAuth(returnTo?: string) {
  try {
    return await authenticateSession();
  } catch (error) {
    const returnToParam = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : '';
    redirect(`/authenticate${returnToParam}`);
  }
}

 