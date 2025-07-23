import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as stytch from 'stytch';
import { getDb, initializeDatabase, dbRowToNote } from '../../../../../lib/db';

const STYTCH_PROJECT_ID = process.env.STYTCH_PROJECT_ID;
const STYTCH_SECRET = process.env.STYTCH_SECRET;
const STYTCH_PROJECT_ENV = process.env.STYTCH_PROJECT_ENV || 'test';

const client = new stytch.B2BClient({
  project_id: STYTCH_PROJECT_ID || '',
  secret: STYTCH_SECRET || '',
  env: STYTCH_PROJECT_ENV === 'live' ? stytch.envs.live : stytch.envs.test,
});

// Helper function to authenticate session and get user info
async function authenticateSession() {
  const cookieStore = await cookies();
  const sessionToken =
    cookieStore.get('stytch_session')?.value ||
    cookieStore.get('stytch_session_jwt')?.value ||
    cookieStore.get('stytch_session_jwt_test')?.value;

  if (!sessionToken) {
    throw new Error('No active session found');
  }

  const sessionResponse = await client.sessions.authenticate({
    session_token: sessionToken,
  });

  return {
    member_id: sessionResponse.member.member_id,
    organization_id: sessionResponse.organization.organization_id,
  };
}

// POST /api/notes/new - Create a new empty note and return its ID
export async function POST(request: NextRequest) {
  try {
    // Initialize database if needed
    await initializeDatabase();

    // Authenticate session
    const { member_id, organization_id } = await authenticateSession();

    const db = getDb();

    // Create a new empty note
    const result = await db.query(
      `
      INSERT INTO notes (title, content, member_id, organization_id, visibility, is_favorite, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
      [
        'Untitled',
        '# Untitled\n\nStart writing your note here...',
        member_id,
        organization_id,
        'private',
        false,
        [],
      ]
    );

    const note = dbRowToNote(result.rows[0]);

    return NextResponse.json({ note }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating new note:', error);

    if (error.message === 'No active session found') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create new note' },
      { status: 500 }
    );
  }
}
