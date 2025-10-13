import { NextRequest, NextResponse } from 'next/server';
import { NotesService } from '@/lib/NotesService';
import { DatabaseNotConfiguredError } from '@/lib/db';

// GET /api/notes/[id] - Get a specific note
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const notesService = await NotesService.fromSessionAuth();
    const { id } = await params;

    const note = await notesService.getNoteById(id);

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({ note });
  } catch (error: any) {
    console.error('Error fetching note:', error);

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
    const notesService = await NotesService.fromSessionAuth();
    const { id } = await params;

    const body = await request.json();
    const { title, content, visibility, is_favorite, tags } = body;

    const note = await notesService.updateNote(id, {
      title,
      content,
      visibility,
      is_favorite,
      tags,
    });

    return NextResponse.json({ note });
  } catch (error: any) {
    console.error('Error updating note:', error);

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

    // Handle specific error cases from NotesService
    if (error.message === 'Note not found or access denied') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (
      error.message === 'Only the creator can edit private notes' ||
      error.message === 'Only the creator can make a shared note private'
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error.message === 'Visibility must be either "private" or "shared"') {
      return NextResponse.json({ error: error.message }, { status: 400 });
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
    const notesService = await NotesService.fromSessionAuth();
    const { id } = await params;

    const success = await notesService.deleteNote(id);

    return NextResponse.json({ success });
  } catch (error: any) {
    console.error('Error deleting note:', error);

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

    // Handle specific error cases from NotesService
    if (error.message === 'Note not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (
      error.message ===
        'Only the note owner or an admin can delete shared notes' ||
      error.message === 'You can only delete notes you created'
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    );
  }
}
