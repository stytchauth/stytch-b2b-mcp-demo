import { NextRequest, NextResponse } from 'next/server';
import { NotesService } from '@/lib/NotesService';

// POST /api/notes/new - Create a new empty note and return its ID
export async function POST(request: NextRequest) {
  try {
    const notesService = await NotesService.fromSessionAuth();

    // Create a new empty note with default content
    const note = await notesService.createNote({
      title: 'Untitled',
      content: '# Untitled\n\nStart writing your note here...',
      visibility: 'private',
      is_favorite: false,
      tags: [],
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating new note:', error);

    if (error.message === 'Authentication required - no session info available' || 
        error.message === 'No active session found') {
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
