import { NextRequest, NextResponse } from 'next/server';
import { authenticateSession, client } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { organization_name, organization_slug } = await request.json();

    if (!organization_name?.trim()) {
      return NextResponse.json(
        { error: 'Organization name is required' },
        { status: 400 }
      );
    }

    // Authenticate session and get current user info
    const sessionResponse = await authenticateSession();

    // Create organization using Stytch SDK
    const orgResponse = await client.organizations.create({
      organization_name: organization_name.trim(),
      organization_slug: organization_slug,
      email_jit_provisioning: 'NOT_ALLOWED',
      email_invites: 'ALL_ALLOWED',
      auth_methods: 'ALL_ALLOWED',
      allowed_auth_methods: ['magic_link', 'google_oauth'],
    });

    // Add the current user as an admin member of the new organization using SDK
    const memberResponse = await client.organizations.members.create({
      organization_id: orgResponse.organization.organization_id,
      email_address: sessionResponse.member.email_address,
      name: sessionResponse.member.name || sessionResponse.member.email_address,
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
}
