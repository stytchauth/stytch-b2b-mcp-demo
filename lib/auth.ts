import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import * as stytch from 'stytch';

const STYTCH_PROJECT_ID = process.env.STYTCH_PROJECT_ID;
const STYTCH_SECRET = process.env.STYTCH_SECRET;
const STYTCH_PROJECT_ENV = process.env.STYTCH_PROJECT_ENV || 'test';

export const client = new stytch.B2BClient({
  project_id: STYTCH_PROJECT_ID || '',
  secret: STYTCH_SECRET || '',
  env: STYTCH_PROJECT_ENV === 'live' ? stytch.envs.live : stytch.envs.test,
});

// Helper function to authenticate session and get user info
export async function authenticateSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("stytch_session");

  if (!sessionCookie) {
    redirect("/");
  }

  let session;
  try {
    session = await client.sessions.authenticate({
      session_token: sessionCookie?.value,
    });
  } catch (error) {
    console.error('Session authentication error. Redirecting to login.');
    redirect("/");
  }

  return session;
}

 