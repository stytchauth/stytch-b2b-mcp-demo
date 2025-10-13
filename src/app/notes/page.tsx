'use client';

import { AppSidebar } from '../../components/app-sidebar';
import { SidebarInset, SidebarTrigger } from '../../components/ui/sidebar';
import NotesEditor from '../../components/NotesEditor';
import {
  getNoteById,
  getAllNotes,
  Note,
  clearNotesCache,
  notesEnabled,
} from '../../../lib/notesData';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMemo, useState, useEffect, useRef } from 'react';
import {
  useStytchMemberSession,
  useStytchOrganization,
} from '@stytch/nextjs/b2b';
import { Button } from '../../components/ui/button';
import { FileText, Home, PlusCircle, Lock } from 'lucide-react';
import Link from 'next/link';

export default function NotesPage() {
  const { session, isInitialized } = useStytchMemberSession();
  const { organization } = useStytchOrganization();
  const router = useRouter();
  const searchParams = useSearchParams();
  const noteId = searchParams.get('id'); // Get note ID from URL params

  const [note, setNote] = useState<Note | null>(null);
  const [noteNotFound, setNoteNotFound] = useState(false);
  const [noNoteSelected, setNoNoteSelected] = useState(false);
  const [loadingError, setLoadingError] = useState(false);
  const [availableNotes, setAvailableNotes] = useState<Note[]>([]);
  const [notesDisabled, setNotesDisabled] = useState(false);

  // Track the current organization ID to detect changes
  const previousOrgIdRef = useRef<string | null>(null);

  useEffect(() => {
    const loadNote = async () => {
      try {
        setNoteNotFound(false);
        setNoNoteSelected(false);
        setLoadingError(false);

        if (!noteId) {
          // No note ID provided, show available notes selection UI
          const allNotes = await getAllNotes();
          setAvailableNotes(allNotes);
          setNotesDisabled(!notesEnabled());
          setNoNoteSelected(true);
          setNote(null);
          return;
        }

        const foundNote = await getNoteById(noteId!);

        // If note not found, set the not found state
        if (!foundNote) {
          setNoteNotFound(true);
          setNote(null);
        } else {
          setNote(foundNote);
        }
        setNotesDisabled(!notesEnabled());
      } catch (error) {
        console.error('Error loading note:', error);
        if (
          error instanceof Error &&
          error.message.includes('Notes are disabled')
        ) {
          setNotesDisabled(true);
        } else {
          setLoadingError(true);
        }
        setNote(null);
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
        setNoteNotFound(false);
        setNoNoteSelected(false);
        setLoadingError(false);
        setAvailableNotes([]);
        setNotesDisabled(false);
      }

      // Update the tracked organization ID
      previousOrgIdRef.current = currentOrgId;

      // Always load note when noteId changes or organization changes
      loadNote();
    }
  }, [noteId, session, organization]);

  if (isInitialized && !session) {
    router.replace('/');
    return null;
  }

  const handleNoteUpdate = (updatedNote: Note) => {
    // Update the note in state and invalidate cache
    setNote(updatedNote);
  };

  // Show no note selected page
  if (noNoteSelected) {
    return (
      <>
        <AppSidebar />
        <SidebarInset>
          <main className="flex-1 flex flex-col">
            <header className="flex items-center p-4 md:p-6 pb-0">
              <SidebarTrigger className="md:hidden mr-2" />
            </header>
            <div
              className="flex-1 flex items-center justify-center text-center px-4 md:px-6"
              style={{ alignItems: 'flex-start', paddingTop: '10vh' }}
            >
              <div className="w-full max-w-2xl">
                <FileText className="w-16 h-16 text-blue-400 mb-4 mx-auto" />
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  Welcome to Your Notes! 📝
                </h1>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {notesDisabled
                    ? 'Notes are read-only because no database is configured. You can still view existing notes in other organizations once a database is connected.'
                    : 'Please select a note from the sidebar or create a new one to get started.'}
                </p>

                {!notesDisabled && availableNotes.length > 0 && (
                  <div className="mb-6 w-full max-w-md mx-auto">
                    <h3 className="text-base font-medium text-gray-900 mb-2">
                      Recent Notes
                    </h3>
                    <div className="space-y-1">
                      {availableNotes.slice(0, 5).map(note => (
                        <Link
                          key={note.id}
                          href={`/notes?id=${note.id}`}
                          className="block px-3 py-2 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-2 font-medium text-gray-900 text-sm">
                            <span className="truncate flex-1">
                              {note.title}
                            </span>
                            {note.visibility === 'private' && (
                              <Lock className="w-3 h-3 text-gray-500 flex-shrink-0" />
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {note.updatedAt.toLocaleDateString()}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 justify-center">
                  {!notesDisabled && (
                    <Button asChild>
                      <Link href="/dashboard">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Create New Note
                      </Link>
                    </Button>
                  )}
                  <Button variant="outline" asChild>
                    <Link href="/dashboard">
                      <Home className="w-4 h-4 mr-2" />
                      Go to Dashboard
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </>
    );
  }

  // Show note not found page
  if (noteNotFound) {
    return (
      <>
        <AppSidebar />
        <SidebarInset>
          <main className="flex-1 flex flex-col">
            <header className="flex items-center p-4 md:p-6 pb-0">
              <SidebarTrigger className="md:hidden mr-2" />
            </header>
            <div
              className="flex-1 flex items-center justify-center text-center px-4 md:px-6"
              style={{ alignItems: 'flex-start', paddingTop: '10vh' }}
            >
              <div className="w-full max-w-2xl">
                <FileText className="w-16 h-16 text-gray-400 mb-4 mx-auto" />
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  Note Not Found
                </h1>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {notesDisabled
                    ? 'Notes are unavailable because no database is configured for this environment.'
                    : `The note with ID "${noteId}" could not be found. It may have been deleted or you might not have permission to view it.`}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button asChild>
                    <Link href="/dashboard">
                      <Home className="w-4 h-4 mr-2" />
                      Go to Dashboard
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/notes">
                      <FileText className="w-4 h-4 mr-2" />
                      Browse Notes
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </>
    );
  }

  // Show loading error page
  if (loadingError) {
    return (
      <>
        <AppSidebar />
        <SidebarInset>
          <main className="flex-1 flex flex-col">
            <header className="flex items-center p-4 md:p-6 pb-0">
              <SidebarTrigger className="md:hidden mr-2" />
            </header>
            <div
              className="flex-1 flex items-center justify-center text-center px-4 md:px-6"
              style={{ alignItems: 'flex-start', paddingTop: '10vh' }}
            >
              <div className="w-full max-w-2xl">
                <FileText className="w-16 h-16 text-red-400 mb-4 mx-auto" />
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  Error Loading Note
                </h1>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {notesDisabled
                    ? 'Notes are disabled because no database is configured. Connect a database and refresh to edit notes.'
                    : 'There was an error loading this note. Please check your connection and try again.'}
                </p>
                <div className="flex gap-3 justify-center">
                  {!notesDisabled && (
                    <Button onClick={() => window.location.reload()}>
                      Try Again
                    </Button>
                  )}
                  <Button variant="outline" asChild>
                    <Link href="/dashboard">
                      <Home className="w-4 h-4 mr-2" />
                      Go to Dashboard
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </>
    );
  }

  // Show fallback if no note is loaded yet
  if (!note) {
    return (
      <>
        <AppSidebar />
        <SidebarInset>
          <main className="flex-1 flex flex-col">
            <header className="flex items-center p-4 md:p-6 pb-0">
              <SidebarTrigger className="md:hidden mr-2" />
            </header>
            <div className="flex-1" />
          </main>
        </SidebarInset>
      </>
    );
  }

  return (
    <>
      <AppSidebar />
      <SidebarInset>
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
      </SidebarInset>
    </>
  );
}
