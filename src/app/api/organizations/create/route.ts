import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as stytch from 'stytch';

const STYTCH_PROJECT_ID = process.env.STYTCH_PROJECT_ID;
const STYTCH_SECRET = process.env.STYTCH_SECRET;
const STYTCH_PROJECT_ENV = process.env.STYTCH_PROJECT_ENV || 'test';

const client = new stytch.B2BClient({
  project_id: STYTCH_PROJECT_ID || '',
  secret: STYTCH_SECRET || '',
  env: STYTCH_PROJECT_ENV === 'live' ? stytch.envs.live : stytch.envs.test,
});

export async function POST(request: NextRequest) {
  try {
    const { organization_name, organization_slug } = await request.json();

    if (!organization_name?.trim()) {
      return NextResponse.json(
        { error: 'Organization name is required' },
        { status: 400 }
      );
    }

    if (!STYTCH_PROJECT_ID || !STYTCH_SECRET) {
      return NextResponse.json(
        {
          error:
            'Missing required environment variables: STYTCH_PROJECT_ID and STYTCH_SECRET',
        },
        { status: 500 }
      );
    }

    // Get the session token from cookies
    const cookieStore = cookies();
    const sessionToken =
      cookieStore.get('stytch_session')?.value ||
      cookieStore.get('stytch_session_jwt')?.value ||
      cookieStore.get('stytch_session_jwt_test')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No active session found' },
        { status: 401 }
      );
    }

    // Get current user info from session using Stytch SDK
    try {
      const sessionResponse = await client.sessions.authenticate({
        session_token: sessionToken,
      });

      const currentUser = sessionResponse.member;

      // Create organization using Stytch SDK
      const orgResponse = await client.organizations.create({
        organization_name: organization_name.trim(),
        organization_slug: organization_slug,
        email_jit_provisioning: 'NOT_ALLOWED',
        email_invites: 'ALL_ALLOWED',
        auth_methods: 'ALL_ALLOWED',
        allowed_auth_methods: ['magic_link', 'google_oauth'],
      });

      console.log(
        'Organization created:',
        orgResponse.organization.organization_name
      );

      // Add the current user as an admin member of the new organization using SDK
      const memberResponse = await client.organizations.members.create({
        organization_id: orgResponse.organization.organization_id,
        email_address: currentUser.email_address,
        name: currentUser.name || currentUser.email_address,
        roles: ['stytch_admin'],
      });

      // Return success with organization info - let frontend handle session exchange
      return NextResponse.json({
        success: true,
        organization: orgResponse.organization,
        member: memberResponse.member,
      });
    } catch (error: any) {
      console.error('Organization creation error:', error);

      // Handle session authentication errors
      if (
        error.error_type === 'session_not_found' ||
        error.status_code === 401
      ) {
        return NextResponse.json(
          { error: 'Invalid session - please log in again' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: error.error_message || 'Failed to create organization' },
        { status: error.status_code || 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
