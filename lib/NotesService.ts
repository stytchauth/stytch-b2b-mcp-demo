import {
  getDb,
  initializeDatabase,
  dbRowToNote,
  isDatabaseConfigured,
  DatabaseNotConfiguredError,
} from './db';
import { authenticateSession } from './auth';
import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types';

interface SessionInfo {
  member_id: string;
  organization_id: string;
  roles?: any[];
}

export class NotesService {
  private sessionInfo: SessionInfo | null = null;

  constructor(sessionInfo?: SessionInfo) {
    this.sessionInfo = sessionInfo || null;
  }

  // Create a NotesService instance from MCP authInfo
  static async fromMCPAuthInfo(authInfo?: AuthInfo): Promise<NotesService> {
    if (!authInfo?.extra) {
      throw new Error('Authentication required - no auth info available');
    }

    // Extract member/organization info from Stytch OAuth token introspection result
    // Based on actual token structure: subject contains member_id, organization is nested
    const organization = authInfo.extra.organization as
      | { organization_id?: string }
      | undefined;
    const sessionInfo = {
      member_id: authInfo.extra.subject as string, // OAuth subject contains the full member ID
      organization_id: organization?.organization_id as string, // Organization ID is nested
      roles: Array.isArray(authInfo.extra.roles) ? authInfo.extra.roles : [], // Roles if available
    };

    // Validate required fields
    if (!sessionInfo.member_id) {
      throw new Error(
        'Authentication failed - no member_id found in token subject'
      );
    }
    if (!sessionInfo.organization_id) {
      throw new Error(
        'Authentication failed - no organization_id found in token organization'
      );
    }

    return new NotesService(sessionInfo);
  }

  // Create a NotesService instance from existing session authentication
  static async fromSessionAuth(): Promise<NotesService> {
    const sessionResponse = await authenticateSession();
    const sessionInfo = {
      member_id: sessionResponse.member.member_id,
      organization_id: sessionResponse.organization.organization_id,
      roles: sessionResponse.member.roles || [],
    };

    return new NotesService(sessionInfo);
  }

  private ensureSessionInfo(): SessionInfo {
    if (!this.sessionInfo) {
      throw new Error('Authentication required - no session info available');
    }
    return this.sessionInfo;
  }

  // Get all notes accessible to the current user
  async getNotes() {
    if (!isDatabaseConfigured()) {
      throw new DatabaseNotConfiguredError();
    }
    await initializeDatabase();
    const { member_id, organization_id } = this.ensureSessionInfo();

    const db = getDb();
    const result = await db.query(
      `
      SELECT * FROM notes 
      WHERE organization_id = $1 
      AND (
        (visibility = 'private' AND member_id = $2) 
        OR visibility = 'shared'
      )
      ORDER BY updated_at DESC
    `,
      [organization_id, member_id]
    );

    return result.rows.map(dbRowToNote);
  }

  // Get a specific note by ID
  async getNoteById(noteId: string) {
    if (!isDatabaseConfigured()) {
      throw new DatabaseNotConfiguredError();
    }
    await initializeDatabase();
    const { member_id, organization_id } = this.ensureSessionInfo();

    const db = getDb();
    const result = await db.query(
      `
      SELECT * FROM notes 
      WHERE id = $1 
      AND organization_id = $2 
      AND (
        (visibility = 'private' AND member_id = $3) 
        OR visibility = 'shared'
      )
    `,
      [noteId, organization_id, member_id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return dbRowToNote(result.rows[0]);
  }

  // Create a new note
  async createNote({
    title,
    content,
    visibility = 'private',
    is_favorite = false,
    tags = [],
  }: {
    title?: string;
    content?: string;
    visibility?: 'private' | 'shared';
    is_favorite?: boolean;
    tags?: string[];
  }) {
    if (!isDatabaseConfigured()) {
      throw new DatabaseNotConfiguredError();
    }
    await initializeDatabase();
    const { member_id, organization_id } = this.ensureSessionInfo();

    // Validate required fields
    if (!title && !content) {
      throw new Error('Title or content is required');
    }

    // Validate visibility
    if (visibility !== 'private' && visibility !== 'shared') {
      throw new Error('Visibility must be either "private" or "shared"');
    }

    const db = getDb();
    const result = await db.query(
      `
      INSERT INTO notes (title, content, member_id, organization_id, visibility, is_favorite, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
      [
        title || 'Untitled',
        content || '',
        member_id,
        organization_id,
        visibility,
        is_favorite,
        tags,
      ]
    );

    return dbRowToNote(result.rows[0]);
  }

  // Update an existing note
  async updateNote(
    noteId: string,
    updates: {
      title?: string;
      content?: string;
      visibility?: 'private' | 'shared';
      is_favorite?: boolean;
      tags?: string[];
    }
  ) {
    if (!isDatabaseConfigured()) {
      throw new DatabaseNotConfiguredError();
    }
    await initializeDatabase();
    const { member_id, organization_id } = this.ensureSessionInfo();

    const db = getDb();

    // First check if the note exists and user has access
    const checkResult = await db.query(
      `
      SELECT * FROM notes 
      WHERE id = $1 
      AND organization_id = $2 
      AND (
        (visibility = 'private' AND member_id = $3) 
        OR visibility = 'shared'
      )
    `,
      [noteId, organization_id, member_id]
    );

    if (checkResult.rows.length === 0) {
      throw new Error('Note not found or access denied');
    }

    const existingNote = checkResult.rows[0];

    // Only the creator can edit private notes, but anyone can edit shared notes
    if (
      existingNote.visibility === 'private' &&
      existingNote.member_id !== member_id
    ) {
      throw new Error('Only the creator can edit private notes');
    }

    // Validate visibility if provided
    if (
      updates.visibility &&
      updates.visibility !== 'private' &&
      updates.visibility !== 'shared'
    ) {
      throw new Error('Visibility must be either "private" or "shared"');
    }

    // Only the creator can change visibility from shared to private
    if (
      updates.visibility === 'private' &&
      existingNote.visibility === 'shared' &&
      existingNote.member_id !== member_id
    ) {
      throw new Error('Only the creator can make a shared note private');
    }

    // Build update query dynamically
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.title !== undefined) {
      updateFields.push(`title = $${paramCount++}`);
      values.push(updates.title);
    }
    if (updates.content !== undefined) {
      updateFields.push(`content = $${paramCount++}`);
      values.push(updates.content);
    }
    if (updates.visibility !== undefined) {
      updateFields.push(`visibility = $${paramCount++}`);
      values.push(updates.visibility);
    }
    if (updates.is_favorite !== undefined) {
      updateFields.push(`is_favorite = $${paramCount++}`);
      values.push(updates.is_favorite);
    }
    if (updates.tags !== undefined) {
      updateFields.push(`tags = $${paramCount++}`);
      values.push(updates.tags);
    }

    updateFields.push(`updated_at = NOW()`);
    values.push(noteId, organization_id, member_id);

    const result = await db.query(
      `
      UPDATE notes 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount++} 
      AND organization_id = $${paramCount++}
      AND (
        (visibility = 'private' AND member_id = $${paramCount++}) 
        OR visibility = 'shared'
      )
      RETURNING *
    `,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Failed to update note');
    }

    return dbRowToNote(result.rows[0]);
  }

  // Delete a note
  async deleteNote(noteId: string) {
    await initializeDatabase();
    const { member_id, organization_id, roles } = this.ensureSessionInfo();

    const db = getDb();

    // First, check if the note exists and get its details
    const noteResult = await db.query(
      `
      SELECT * FROM notes 
      WHERE id = $1 
      AND organization_id = $2
    `,
      [noteId, organization_id]
    );

    if (noteResult.rows.length === 0) {
      throw new Error('Note not found');
    }

    const note = noteResult.rows[0];
    const isAdmin = roles?.some((role: any) => String(role) === 'stytch_admin');
    const isOwner = note.member_id === member_id;
    const isSharedNote = note.visibility === 'shared';

    // Check permissions: owner can delete any note, admin can delete shared notes
    if (!isOwner && !(isAdmin && isSharedNote)) {
      throw new Error(
        isSharedNote
          ? 'Only the note owner or an admin can delete shared notes'
          : 'You can only delete notes you created'
      );
    }

    // Delete the note
    const deleteResult = await db.query(
      `
      DELETE FROM notes 
      WHERE id = $1 
      AND organization_id = $2
      RETURNING *
    `,
      [noteId, organization_id]
    );

    return deleteResult.rows.length > 0;
  }
}
