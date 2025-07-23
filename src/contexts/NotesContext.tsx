'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Note } from '../../lib/notesData';

interface NotesContextType {
  recentNotes: Note[];
  setRecentNotes: (notes: Note[]) => void;
  updateNote: (updatedNote: Note) => void;
  addNote: (newNote: Note) => void;
  removeNote: (noteId: string) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);

  const updateNote = useCallback((updatedNote: Note) => {
    setRecentNotes(currentNotes => {
      // Find if the note exists in the current list
      const existingIndex = currentNotes.findIndex(
        note => note.id === updatedNote.id
      );

      if (existingIndex >= 0) {
        // Update existing note
        const newNotes = [...currentNotes];
        newNotes[existingIndex] = updatedNote;

        // Sort by updated date (most recent first)
        return newNotes.sort(
          (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
        );
      } else {
        // Add new note to the list
        const newNotes = [updatedNote, ...currentNotes];

        // Keep only the 3 most recent
        return newNotes
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
          .slice(0, 3);
      }
    });
  }, []);

  const addNote = useCallback((newNote: Note) => {
    setRecentNotes(currentNotes => {
      const newNotes = [newNote, ...currentNotes];

      // Keep only the 3 most recent
      return newNotes
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, 3);
    });
  }, []);

  const removeNote = useCallback((noteId: string) => {
    setRecentNotes(currentNotes =>
      currentNotes.filter(note => note.id !== noteId)
    );
  }, []);

  return (
    <NotesContext.Provider
      value={{
        recentNotes,
        setRecentNotes,
        updateNote,
        addNote,
        removeNote,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}
