import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as stytch from 'stytch';
import {
  getDb,
  initializeDatabase,
  dbRowToNote,
  DatabaseNote,
} from '../../../../lib/db';

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

// GET /api/notes - Get all notes accessible to the current user
export async function GET(request: NextRequest) {
  try {
    // Initialize database if needed
    await initializeDatabase();

    // Authenticate session
    const { member_id, organization_id } = await authenticateSession();

    const db = getDb();

    // Get notes that are either:
    // 1. Private notes created by the current user
    // 2. Shared notes in the current organization
    const result = await db.query(
      `
      SELECT * FROM notes 
      WHERE organization_id = $1 
      AND (
        (visibility = 'private' AND member_id = $2) 
        OR visibility = 'shared'
      )
      ORDER BY updated_at DESC
    `,
      [organization_id, member_id]
    );

    const notes = result.rows.map(dbRowToNote);

    return NextResponse.json({ notes });
  } catch (error: any) {
    console.error('Error fetching notes:', error);

    if (error.message === 'No active session found') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

// POST /api/notes - Create a new note
export async function POST(request: NextRequest) {
  try {
    // Initialize database if needed
    await initializeDatabase();

    // Authenticate session
    const { member_id, organization_id } = await authenticateSession();

    const body = await request.json();
    const {
      title,
      content,
      visibility = 'private',
      is_favorite = false,
      tags = [],
    } = body;

    // Validate required fields
    if (!title && !content) {
      return NextResponse.json(
        { error: 'Title or content is required' },
        { status: 400 }
      );
    }

    // Validate visibility
    if (visibility !== 'private' && visibility !== 'shared') {
      return NextResponse.json(
        { error: 'Visibility must be either "private" or "shared"' },
        { status: 400 }
      );
    }

    const db = getDb();

    const result = await db.query(
      `
      INSERT INTO notes (title, content, member_id, organization_id, visibility, is_favorite, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
      [
        title || 'Untitled',
        content || '',
        member_id,
        organization_id,
        visibility,
        is_favorite,
        tags,
      ]
    );

    const note = dbRowToNote(result.rows[0]);

    return NextResponse.json({ note }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating note:', error);

    if (error.message === 'No active session found') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}
