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
    roles: sessionResponse.member.roles || [],
  };
}

// GET /api/notes/[id] - Get a specific note
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeDatabase();
    const { member_id, organization_id } = await authenticateSession();
    const { id } = await params;

    const db = getDb();

    // Get note that user has access to
    const result = await db.query(
      `
      SELECT * FROM notes 
      WHERE id = $1 
      AND organization_id = $2 
      AND (
        (visibility = 'private' AND member_id = $3) 
        OR visibility = 'shared'
      )
    `,
      [id, organization_id, member_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Note not found or access denied' },
        { status: 404 }
      );
    }

    const note = dbRowToNote(result.rows[0]);

    return NextResponse.json({ note });
  } catch (error: any) {
    console.error('Error fetching note:', error);

    if (error.message === 'No active session found') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch note' },
      { status: 500 }
    );
  }
}

// PUT /api/notes/[id] - Update a specific note
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeDatabase();
    const { member_id, organization_id } = await authenticateSession();
    const { id } = await params;

    const body = await request.json();
    const { title, content, visibility, is_favorite, tags } = body;

    const db = getDb();

    // First check if the note exists and user has access
    const checkResult = await db.query(
      `
      SELECT * FROM notes 
      WHERE id = $1 
      AND organization_id = $2 
      AND (
        (visibility = 'private' AND member_id = $3) 
        OR visibility = 'shared'
      )
    `,
      [id, organization_id, member_id]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Note not found or access denied' },
        { status: 404 }
      );
    }

    const existingNote = checkResult.rows[0];

    // Only the creator can edit private notes, but anyone can edit shared notes
    if (
      existingNote.visibility === 'private' &&
      existingNote.member_id !== member_id
    ) {
      return NextResponse.json(
        { error: 'Only the creator can edit private notes' },
        { status: 403 }
      );
    }

    // Validate visibility if provided
    if (visibility && visibility !== 'private' && visibility !== 'shared') {
      return NextResponse.json(
        { error: 'Visibility must be either "private" or "shared"' },
        { status: 400 }
      );
    }

    // Only the creator can change visibility from shared to private
    if (
      visibility === 'private' &&
      existingNote.visibility === 'shared' &&
      existingNote.member_id !== member_id
    ) {
      return NextResponse.json(
        { error: 'Only the creator can make a shared note private' },
        { status: 403 }
      );
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (content !== undefined) {
      updates.push(`content = $${paramCount++}`);
      values.push(content);
    }
    if (visibility !== undefined) {
      updates.push(`visibility = $${paramCount++}`);
      values.push(visibility);
    }
    if (is_favorite !== undefined) {
      updates.push(`is_favorite = $${paramCount++}`);
      values.push(is_favorite);
    }
    if (tags !== undefined) {
      updates.push(`tags = $${paramCount++}`);
      values.push(tags);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id, organization_id, member_id);

    const result = await db.query(
      `
      UPDATE notes 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount++} 
      AND organization_id = $${paramCount++}
      AND (
        (visibility = 'private' AND member_id = $${paramCount++}) 
        OR visibility = 'shared'
      )
      RETURNING *
    `,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update note' },
        { status: 500 }
      );
    }

    const note = dbRowToNote(result.rows[0]);

    return NextResponse.json({ note });
  } catch (error: any) {
    console.error('Error updating note:', error);

    if (error.message === 'No active session found') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    );
  }
}

// DELETE /api/notes/[id] - Delete a specific note
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeDatabase();
    const { member_id, organization_id, roles } = await authenticateSession();
    const { id } = await params;

    const db = getDb();

    // First, check if the note exists and get its details
    const noteResult = await db.query(
      `
      SELECT * FROM notes 
      WHERE id = $1 
      AND organization_id = $2
    `,
      [id, organization_id]
    );

    if (noteResult.rows.length === 0) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    const note = noteResult.rows[0];
    const isAdmin = roles.some(role => String(role) === 'stytch_admin');
    const isOwner = note.member_id === member_id;
    const isSharedNote = note.visibility === 'shared';

    // Check permissions: owner can delete any note, admin can delete shared notes
    if (!isOwner && !(isAdmin && isSharedNote)) {
      return NextResponse.json(
        {
          error: isSharedNote
            ? 'Only the note owner or an admin can delete shared notes'
            : 'You can only delete notes you created',
        },
        { status: 403 }
      );
    }

    // Delete the note
    const deleteResult = await db.query(
      `
      DELETE FROM notes 
      WHERE id = $1 
      AND organization_id = $2
      RETURNING *
    `,
      [id, organization_id]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting note:', error);

    if (error.message === 'No active session found') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    );
  }
}
