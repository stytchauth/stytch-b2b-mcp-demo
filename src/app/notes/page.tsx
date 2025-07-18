'use client';

import { AppSidebar } from "../../components/app-sidebar"
import { SidebarTrigger } from "../../components/ui/sidebar"
import NotesEditor from "../../components/NotesEditor"
import { getNoteById, getAllNotes, Note } from "../../../lib/notesData"
import { useSearchParams, useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { useStytchMemberSession } from '@stytch/nextjs/b2b'

export default function NotesPage() {
  const { session, isInitialized } = useStytchMemberSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const noteId = searchParams.get('id') || 'team-notes' // Default to team-notes if no ID provided
  
  const note = useMemo(() => {
    const foundNote = getNoteById(noteId)
    
    // If note not found, return a default note structure
    if (!foundNote) {
      return {
        id: 'not-found',
        title: 'Note Not Found',
        content: `# Note Not Found

The note with ID "${noteId}" could not be found.

## Available Notes

${getAllNotes().map(n => `- [${n.title}](/notes?id=${n.id})`).join('\n')}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        isFavorite: false,
        tags: ['error']
      }
    }
    
    return foundNote
  }, [noteId])

  if (isInitialized && !session) {
    router.replace("/");
    return null;
  }

  const handleNoteUpdate = (updatedNote: Note) => {
    // In a real app, you might want to update a global state or cache here
    console.log('Note updated:', updatedNote)
  }

  return (
    <div className="flex h-full">
      <AppSidebar />
      <main className="flex-1 flex flex-col pr-0 max-w-full overflow-hidden">
        <div className="flex items-center p-4 md:p-6 pb-0 pr-4 md:pr-6">
          <SidebarTrigger className="md:hidden mr-2" />
        </div>
        <div className="flex-1" style={{ width: 'min(896px, calc(100vw - 2rem))' }}>
          <NotesEditor 
            note={note}
            onNoteUpdate={handleNoteUpdate}
            readOnly={false}
          />
        </div>
      </main>
    </div>
  )
} 