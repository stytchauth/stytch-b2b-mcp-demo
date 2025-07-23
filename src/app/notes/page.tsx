'use client';

import { AppSidebar } from '../../components/app-sidebar';
import { SidebarTrigger } from '../../components/ui/sidebar';
import NotesEditor from '../../components/NotesEditor';
import {
  getNoteById,
  getAllNotes,
  Note,
  clearNotesCache,
} from '../../../lib/notesData';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMemo, useState, useEffect, useRef } from 'react';
import {
  useStytchMemberSession,
  useStytchOrganization,
} from '@stytch/nextjs/b2b';

export default function NotesPage() {
  const { session, isInitialized } = useStytchMemberSession();
  const { organization } = useStytchOrganization();
  const router = useRouter();
  const searchParams = useSearchParams();
  const noteId = searchParams.get('id'); // Get note ID from URL params

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  // Track the current organization ID to detect changes
  const previousOrgIdRef = useRef<string | null>(null);

  useEffect(() => {
    const loadNote = async () => {
      setLoading(true);
      try {
        if (!noteId) {
          // No note ID provided, show available notes
          const allNotes = await getAllNotes();
          setNote({
            id: 'no-note-selected',
            title: 'Select a Note',
            content: `# Welcome to Your Notes! 📝

Please select a note from the sidebar or create a new one.

## Your Notes

${
  allNotes.length > 0
    ? allNotes.map(n => `- [${n.title}](/notes?id=${n.id})`).join('\n')
    : 'No notes yet. Create your first note by clicking "New Note" in the dashboard!'
}

## Get Started

- **Create private notes** for your personal thoughts
- **Create shared notes** to collaborate with your team
- **Use tags** to organize your notes
- **Star favorites** for quick access`,
            member_id: '',
            organization_id: '',
            visibility: 'private',
            createdAt: new Date(),
            updatedAt: new Date(),
            isFavorite: false,
            tags: ['welcome'],
          });
          return;
        }

        const foundNote = await getNoteById(noteId!);

        // If note not found, create a default note structure
        if (!foundNote) {
          const allNotes = await getAllNotes();
          setNote({
            id: 'not-found',
            title: 'Note Not Found',
            content: `# Note Not Found

The note with ID "${noteId}" could not be found. This might happen if:

- The note was deleted
- You don't have permission to view it
- The note ID is invalid

## Available Notes

${
  allNotes.length > 0
    ? allNotes.map(n => `- [${n.title}](/notes?id=${n.id})`).join('\n')
    : 'No notes available. Create your first note!'
}`,
            member_id: '',
            organization_id: '',
            visibility: 'private',
            createdAt: new Date(),
            updatedAt: new Date(),
            isFavorite: false,
            tags: ['error'],
          });
        } else {
          setNote(foundNote);
        }
      } catch (error) {
        console.error('Error loading note:', error);
        // Set an error note
        setNote({
          id: 'error',
          title: 'Error Loading Note',
          content:
            '# Error Loading Note\n\nThere was an error loading this note. Please try again or check your connection.',
          member_id: '',
          organization_id: '',
          visibility: 'private',
          createdAt: new Date(),
          updatedAt: new Date(),
          isFavorite: false,
          tags: ['error'],
        });
      } finally {
        setLoading(false);
      }
    };

    if (session && organization) {
      const currentOrgId = organization.organization_id;

      // Check if organization has changed
      const orgChanged =
        previousOrgIdRef.current !== null &&
        previousOrgIdRef.current !== currentOrgId;

      if (orgChanged) {
        // Organization changed - clear cache and note, then reload
        clearNotesCache();
        setNote(null);
      }

      // Update the tracked organization ID
      previousOrgIdRef.current = currentOrgId;

      // Load note if we don't have one or if organization changed
      if (!note || orgChanged) {
        loadNote();
      }
    }
  }, [noteId, session, organization]);

  if (isInitialized && !session) {
    router.replace('/');
    return null;
  }

  const handleNoteUpdate = (updatedNote: Note) => {
    // Update the note in state and invalidate cache
    setNote(updatedNote);
    console.log('Note updated:', updatedNote);
  };

  // Show loading state while note is being fetched
  if (loading || !note) {
    return (
      <div className="flex h-full">
        <AppSidebar />
        <main className="flex-1 p-4 md:p-6">
          <header className="flex items-center mb-4">
            <SidebarTrigger className="md:hidden mr-2" />
          </header>
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading note...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <AppSidebar />
      <main className="flex-1 p-4 md:p-6">
        <header className="flex items-center mb-4">
          <SidebarTrigger className="md:hidden mr-2" />
        </header>
        <div
          className="h-[calc(100%-4rem)]"
          style={{ width: 'min(896px, calc(100vw - 2rem))' }}
        >
          <NotesEditor
            note={note}
            onNoteUpdate={handleNoteUpdate}
            readOnly={false}
          />
        </div>
      </main>
    </div>
  );
}
