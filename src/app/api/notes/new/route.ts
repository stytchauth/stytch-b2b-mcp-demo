import { NextRequest, NextResponse } from 'next/server';
import { getDb, initializeDatabase, dbRowToNote } from '@/lib/db';
import { authenticateSession } from '@/lib/auth';

// POST /api/notes/new - Create a new empty note and return its ID
export async function POST(request: NextRequest) {
  try {
    // Initialize database if needed
    await initializeDatabase();

    // Authenticate session
    const sessionResponse = await authenticateSession();
    const { member_id, organization_id } = { 
      member_id: sessionResponse.member.member_id, 
      organization_id: sessionResponse.organization.organization_id 
    };

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
