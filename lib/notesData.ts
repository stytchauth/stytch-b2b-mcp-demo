export interface Note {
  id: string;
  title: string;
  content: string;
  member_id: string;
  organization_id: string;
  visibility: 'private' | 'shared';
  createdAt: Date;
  updatedAt: Date;
  isFavorite: boolean;
  tags?: string[];
}

let notesFeatureEnabled: boolean | null = null;

// Cache for notes to avoid frequent API calls
let notesCache: Note[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 30000; // 30 seconds

export const notesEnabled = () => notesFeatureEnabled !== false;

// Function to clear the notes cache (useful when switching organizations)
export const clearNotesCache = (): void => {
  notesCache = null;
  cacheTimestamp = 0;
};

// Helper function to convert API response to Note objects
function convertApiResponseToNote(apiNote: any): Note {
  return {
    id: apiNote.id,
    title: apiNote.title,
    content: apiNote.content,
    member_id: apiNote.member_id,
    organization_id: apiNote.organization_id,
    visibility: apiNote.visibility,
    createdAt: new Date(apiNote.created_at),
    updatedAt: new Date(apiNote.updated_at),
    isFavorite: apiNote.is_favorite,
    tags: apiNote.tags || [],
  };
}

const syncNotesFeatureFlag = (value: boolean) => {
  notesFeatureEnabled = value;
};

const createFallbackNote = (note: Partial<Note>): Note => {
  return {
    id: note.id ?? 'unsaved-note',
    title: note.title ?? 'Untitled',
    content: note.content ?? '',
    member_id: note.member_id ?? '',
    organization_id: note.organization_id ?? '',
    visibility: (note.visibility as 'private' | 'shared') ?? 'private',
    is_favorite: note.isFavorite ?? false,
    tags: note.tags ?? [],
    createdAt: note.createdAt ?? new Date(),
    updatedAt: note.updatedAt ?? new Date(),
  } as Note;
};

// Utility functions for note management
export const getAllNotes = async (): Promise<Note[]> => {
  try {

    if (notesFeatureEnabled === null) {
      try {
        syncNotesFeatureFlag(true);
      } catch {
        syncNotesFeatureFlag(false);
      }
    }

    if (notesFeatureEnabled === false) {
      return [];
    }

    // Check cache first
    const now = Date.now();
    if (notesCache && now - cacheTimestamp < CACHE_DURATION) {
      return notesCache;
    }

    const response = await fetch('/api/notes');

    if (!response.ok) {
      if (response.status === 503) {
        syncNotesFeatureFlag(false);
        return [];
      }
      const errorText = await response.text();
      throw new Error('Failed to fetch notes');
    }

    const data = await response.json();
    syncNotesFeatureFlag(true);
    const notes = data.notes.map(convertApiResponseToNote);

    // Update cache
    notesCache = notes;
    cacheTimestamp = now;

    return notes;
  } catch (error) {
    console.error('Error fetching notes:', error);
    if (notesFeatureEnabled == null) {
      throw error;
    }
    syncNotesFeatureFlag(false);
    return [];
  }
};

export const getNoteById = async (id: string): Promise<Note | undefined> => {
  try {
    if (notesFeatureEnabled === false) {
      return undefined;
    }

    const response = await fetch(`/api/notes/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return undefined;
      }
      if (response.status === 503) {
        syncNotesFeatureFlag(false);
        return undefined;
      }
      throw new Error('Failed to fetch note');
    }

    const data = await response.json();
    syncNotesFeatureFlag(true);
    return convertApiResponseToNote(data.note);
  } catch (error) {
    console.error('Error fetching note:', error);
    if (notesFeatureEnabled == null) {
      throw error;
    }
    syncNotesFeatureFlag(false);
    return undefined;
  }
};

export const getFavoriteNotes = async (): Promise<Note[]> => {
  const allNotes = await getAllNotes();
  return allNotes.filter(note => note.isFavorite);
};

export const getRecentNotes = async (limit: number = 5): Promise<Note[]> => {
  const allNotes = await getAllNotes();
  return allNotes
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, limit);
};

export const getNotesByTag = async (tag: string): Promise<Note[]> => {
  const allNotes = await getAllNotes();
  return allNotes.filter(note => note.tags?.includes(tag));
};

// API call to save a note (create or update)
export const saveNote = async (note: Partial<Note>): Promise<Note> => {
  try {
    if (notesFeatureEnabled === false) {
      console.warn('saveNote skipped because notes are disabled.');
      return createFallbackNote(note);
    }

    const isUpdate = !!note.id;

    if (isUpdate) {
      // Update existing note
      const response = await fetch(`/api/notes/${note.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: note.title,
          content: note.content,
          visibility: note.visibility,
          is_favorite: note.isFavorite,
          tags: note.tags,
        }),
      });

      if (!response.ok) {
        if (response.status === 503) {
          syncNotesFeatureFlag(false);
          return createFallbackNote(note);
        }
        throw new Error('Failed to update note');
      }

      const data = await response.json();
      syncNotesFeatureFlag(true);
      const updatedNote = convertApiResponseToNote(data.note);

      // Invalidate cache
      notesCache = null;

      return updatedNote;
    } else {
      // Create new note
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: note.title || 'Untitled',
          content: note.content || '',
          visibility: note.visibility || 'private',
          is_favorite: note.isFavorite || false,
          tags: note.tags || [],
        }),
      });

      if (!response.ok) {
        if (response.status === 503) {
          syncNotesFeatureFlag(false);
          return createFallbackNote(note);
        }
        throw new Error('Failed to create note');
      }

      const data = await response.json();
      syncNotesFeatureFlag(true);
      const newNote = convertApiResponseToNote(data.note);

      // Invalidate cache
      notesCache = null;

      return newNote;
    }
  } catch (error) {
    console.error('Error saving note:', error);
    if (notesFeatureEnabled == null) {
      throw error;
    }
    syncNotesFeatureFlag(false);
    throw error;
  }
};

// API call to delete a note
export const deleteNote = async (noteId: string): Promise<boolean> => {
  try {
    if (notesFeatureEnabled === false) {
      console.warn('deleteNote skipped because notes are disabled.');
      return false;
    }

    const response = await fetch(`/api/notes/${noteId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      if (response.status === 503) {
        syncNotesFeatureFlag(false);
        return false;
      }
      throw new Error('Failed to delete note');
    }

    // Invalidate cache
    notesCache = null;

    return true;
  } catch (error) {
    console.error('Error deleting note:', error);
    if (notesFeatureEnabled == null) {
      throw error;
    }
    syncNotesFeatureFlag(false);
    throw error;
  }
};

export const createNewNote = (): Partial<Note> => {
  return {
    title: 'Untitled',
    content: '',
    visibility: 'private',
    isFavorite: false,
    tags: [],
  };
};
