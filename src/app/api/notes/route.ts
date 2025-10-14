import { NextRequest, NextResponse } from 'next/server';
import { NotesService } from '@/lib/NotesService';
import { DatabaseNotConfiguredError } from '@/lib/db';

// GET /api/notes - Get all notes accessible to the current user
export async function GET(request: NextRequest) {
  try {
    const notesService = await NotesService.fromSessionAuth();
    const notes = await notesService.getNotes();

    return NextResponse.json({ notes });
  } catch (error: any) {
    console.error('Error fetching notes:', error);

    if (
      error.message === 'Authentication required - no session info available' ||
      error.message === 'No active session found'
    ) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (error instanceof DatabaseNotConfiguredError) {
      return NextResponse.json(
        { error: 'Notes are disabled because no database is configured.' },
        { status: 503 }
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
    const notesService = await NotesService.fromSessionAuth();
    const body = await request.json();
    const {
      title,
      content,
      visibility = 'private',
      is_favorite = false,
      tags = [],
    } = body;

    const note = await notesService.createNote({
      title,
      content,
      visibility,
      is_favorite,
      tags,
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating note:', error);

    if (
      error.message === 'Authentication required - no session info available' ||
      error.message === 'No active session found'
    ) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (error instanceof DatabaseNotConfiguredError) {
      return NextResponse.json(
        { error: 'Notes are disabled because no database is configured.' },
        { status: 503 }
      );
    }

    // Handle validation errors from NotesService
    if (
      error.message === 'Title or content is required' ||
      error.message === 'Visibility must be either "private" or "shared"'
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}
