"use client"

import { useState, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Star, StarOff, Pencil, Check, Share, Trash2 } from "lucide-react"
import { Note, saveNote, deleteNote } from "../../lib/notesData"

interface NotesEditorProps {
  note: Note;
  onNoteUpdate?: (updatedNote: Note) => void;
  onNoteDelete?: (noteId: string) => void;
  readOnly?: boolean;
}

export default function NotesEditor({ note, onNoteUpdate, onNoteDelete, readOnly = false }: NotesEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [currentNote, setCurrentNote] = useState<Note>(note)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setCurrentNote(note)
    setHasUnsavedChanges(false)
    setIsEditing(false)
  }, [note])

  const handleContentChange = (content: string) => {
    setCurrentNote(prev => ({ ...prev, content }))
    setHasUnsavedChanges(true)
  }

  const handleTitleChange = (title: string) => {
    setCurrentNote(prev => ({ ...prev, title }))
    setHasUnsavedChanges(true)
  }

  const handleSave = async () => {
    if (!hasUnsavedChanges) return
    
    setIsSaving(true)
    try {
      const updatedNote = await saveNote({
        ...currentNote,
        updatedAt: new Date()
      })
      setCurrentNote(updatedNote)
      setHasUnsavedChanges(false)
      onNoteUpdate?.(updatedNote)
    } catch (error) {
      console.error('Failed to save note:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const toggleFavorite = async () => {
    const updatedNote = { ...currentNote, isFavorite: !currentNote.isFavorite }
    setCurrentNote(updatedNote)
    try {
      const savedNote = await saveNote(updatedNote)
      onNoteUpdate?.(savedNote)
    } catch (error) {
      console.error('Failed to update favorite:', error)
      setCurrentNote(currentNote)
    }
  }

  const toggleEditMode = () => {
    if (readOnly) return
    
    if (isEditing && hasUnsavedChanges) {
      handleSave()
    }
    setIsEditing(!isEditing)
  }

  const handleDelete = async () => {
    if (readOnly) return
    
    const confirmed = window.confirm('Are you sure you want to delete this note? This action cannot be undone.')
    
    if (!confirmed) return
    
    setIsDeleting(true)
    try {
      await deleteNote(currentNote.id)
      onNoteDelete?.(currentNote.id)
    } catch (error) {
      console.error('Failed to delete note:', error)
      alert('Failed to delete note. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <header 
        className="flex items-center justify-between pl-4 pr-4 py-4 md:pl-6 md:pr-6 md:py-6 flex-shrink-0 relative"
        style={{ paddingLeft: 'clamp(1rem, 6vw, 8rem)' }}
      >
        <div className="flex items-center gap-2">
          {isEditing ? (
            <input
              type="text"
              value={currentNote.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="text-2xl font-semibold bg-transparent border-none outline-none focus:ring-0 min-w-0"
              placeholder="Untitled"
            />
          ) : (
            <h1 className="text-2xl font-semibold">{currentNote.title}</h1>
          )}
          <Button variant="ghost" size="icon" onClick={toggleFavorite}>
            {currentNote.isFavorite ? (
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ) : (
              <Star className="w-5 h-5" />
            )}
            <span className="sr-only">Favorite</span>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {!readOnly && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleEditMode} 
              className="gap-2"
              disabled={isSaving}
            >
              {isEditing ? (
                <>
                  <Check className="w-4 h-4" />
                  {isSaving ? "Saving..." : "Done"}
                </>
              ) : (
                <>
                  <Pencil className="w-4 h-4" />
                  Edit
                </>
              )}
            </Button>
          )}
          <Button variant="ghost">Share</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={isDeleting} className="focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none">
                <MoreHorizontal className="w-5 h-5" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600"
                disabled={readOnly || isDeleting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? "Deleting..." : "Delete note"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div 
          className="absolute bottom-0 left-0 right-0 h-px bg-border"
          style={{ 
            left: 'clamp(1rem, 6vw, 8rem)'
          }}
        />
      </header>

      {currentNote.tags && currentNote.tags.length > 0 && (
        <div 
          className="flex flex-wrap gap-2 pl-4 pr-4 py-2 md:pl-6 md:pr-6 flex-shrink-0 relative"
          style={{ paddingLeft: 'clamp(1rem, 6vw, 8rem)' }}
        >
          {currentNote.tags.map(tag => (
            <span 
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
            >
              #{tag}
            </span>
          ))}
          <div 
            className="absolute bottom-0 left-0 right-0 h-px bg-border"
            style={{ 
              left: 'clamp(1rem, 6vw, 8rem)'
            }}
          />
        </div>
      )}

      <div className={`flex-1 ${isEditing ? 'p-0' : 'p-0'} overflow-auto`}>
        {isEditing ? (
          <Textarea
            placeholder="Start writing your note here..."
            className="w-full h-full text-base border-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0 break-words"
            style={{ 
              paddingLeft: 'clamp(1rem, 6vw, 8rem)', 
              paddingRight: '1rem', 
              paddingTop: '1rem', 
              paddingBottom: '1rem'
            }}
            value={currentNote.content}
            onChange={(e) => handleContentChange(e.target.value)}
          />
        ) : (
          <div 
            className="prose prose-sm prose-stone dark:prose-invert max-w-none w-full break-words"
            style={{ 
              paddingLeft: 'clamp(1rem, 6vw, 8rem)', 
              paddingRight: '2rem', 
              paddingTop: '1rem', 
              paddingBottom: '1rem'
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {currentNote.content}
            </ReactMarkdown>
          </div>
        )}
      </div>

      <div 
        className="flex items-center justify-between text-xs text-gray-500 pl-4 pr-4 py-2 flex-shrink-0 md:pl-6 md:pr-6 relative"
        style={{ paddingLeft: 'clamp(1rem, 6vw, 8rem)' }}
      >
        <div 
          className="absolute top-0 left-0 right-0 h-px bg-border"
          style={{ 
            left: 'clamp(1rem, 6vw, 8rem)'
          }}
        />
        <span>
          Created: {currentNote.createdAt.toLocaleDateString()}
        </span>
        <span>
          Last updated: {currentNote.updatedAt.toLocaleDateString()}
        </span>
      </div>
    </div>
  )
} 