export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isFavorite: boolean;
  tags?: string[];
}

// Mock notes data - this would typically come from an API or database
const mockNotes: Note[] = [
  {
    id: 'team-notes',
    title: 'Team Notes',
    content: `# Team Notes

This is your collaborative space for team notes and ideas.

## Meeting Notes

- **Date:** Today
- **Attendees:** Team members
- **Agenda:** 
  - Review project progress
  - Discuss upcoming features
  - Plan next sprint

## Action Items

- [ ] Update project documentation
- [ ] Schedule team review session
- [ ] Prepare for next sprint planning

## Ideas & Brainstorming

Use this space to capture creative ideas and thoughts that emerge during collaboration.`,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    isFavorite: true,
    tags: ['team', 'collaboration'],
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    content: `# Getting Started Guide

Welcome to our collaborative workspace! This guide will help you get up and running quickly. This is some long text to see how it looks.

## First Steps

1. **Set up your profile** - Add your name and profile picture
2. **Join your team** - Make sure you're part of the right organization
3. **Explore the features** - Check out notes, members, and settings

## Key Features

### Notes
- Create and edit collaborative documents
- Share notes with team members
- Organize with tags and favorites

### Members
- Invite new team members
- Manage roles and permissions
- View team activity

### Settings
- Configure organization preferences
- Set up integrations
- Manage security settings

## Tips for Success

- Use clear, descriptive titles for your notes
- Tag your content for easy discovery
- Regular team check-ins help keep everyone aligned

Happy collaborating! 🚀`,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12'),
    isFavorite: false,
    tags: ['onboarding', 'guide'],
  },
  {
    id: 'project-roadmap',
    title: 'Project Roadmap Q3',
    content: `# Q3 Project Roadmap

## Overview
Our focus for Q3 is expanding platform capabilities and improving user experience.

## Key Initiatives

### 1. Enhanced Collaboration Features
- **Timeline**: July - August
- **Goals**: 
  - Real-time editing
  - Comment threads
  - Version history
- **Owner**: Product Team

### 2. Mobile Application
- **Timeline**: August - September
- **Goals**:
  - iOS and Android apps
  - Offline capabilities
  - Push notifications
- **Owner**: Mobile Team

### 3. Advanced Analytics
- **Timeline**: September - October
- **Goals**:
  - Usage dashboards
  - Performance metrics
  - User insights
- **Owner**: Data Team

## Success Metrics
- User engagement: +25%
- Feature adoption: >60%
- Customer satisfaction: 4.5+

## Risks & Mitigation
- Resource constraints → Prioritize core features
- Technical challenges → Early prototyping
- Market changes → Regular strategy reviews`,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-14'),
    isFavorite: true,
    tags: ['roadmap', 'planning', 'q3'],
  },
];

// Utility functions for note management
export const getAllNotes = (): Note[] => {
  return mockNotes;
};

export const getNoteById = (id: string): Note | undefined => {
  return mockNotes.find(note => note.id === id);
};

export const getFavoriteNotes = (): Note[] => {
  return mockNotes.filter(note => note.isFavorite);
};

export const getRecentNotes = (limit: number = 5): Note[] => {
  return mockNotes
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, limit);
};

export const getNotesByTag = (tag: string): Note[] => {
  return mockNotes.filter(note => note.tags?.includes(tag));
};

// This would typically be an API call
export const saveNote = async (note: Partial<Note>): Promise<Note> => {
  // Mock implementation - in real app this would call an API
  const updatedNote: Note = {
    id: note.id || `note-${Date.now()}`,
    title: note.title || 'Untitled',
    content: note.content || '',
    createdAt: note.createdAt || new Date(),
    updatedAt: new Date(),
    isFavorite: note.isFavorite || false,
    tags: note.tags || [],
  };

  // In a real app, you'd update the database here
  console.log('Saving note:', updatedNote);

  return updatedNote;
};

// This would typically be an API call
export const deleteNote = async (noteId: string): Promise<boolean> => {
  // Mock implementation - in real app this would call an API
  const noteIndex = mockNotes.findIndex(note => note.id === noteId);

  if (noteIndex === -1) {
    throw new Error('Note not found');
  }

  // Remove the note from the mock data
  mockNotes.splice(noteIndex, 1);

  console.log('Deleted note:', noteId);

  return true;
};

export const createNewNote = (): Partial<Note> => {
  return {
    title: 'Untitled',
    content: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    isFavorite: false,
    tags: [],
  };
};
