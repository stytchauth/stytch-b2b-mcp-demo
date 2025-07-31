import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp';
import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types';
import { z } from 'zod';
import { discovery, fetchUserInfo } from 'openid-client';
import { NotesService } from './NotesService';

export const initializeMCPServer = (server: McpServer) => {
  const formatResponse = (
    description: string,
    data: any
  ): {
    content: Array<{ type: 'text'; text: string }>;
  } => {
    return {
      content: [
        {
          type: 'text',
          text: `Success! ${description} \n \nData: \n ${JSON.stringify(data, null, 2)}`,
        },
      ],
    };
  };

  // Notes resource - for listing and viewing individual notes
  server.resource(
    'Notes',
    new ResourceTemplate('notes://notes/{id}', {
      list: async ({ authInfo }) => {
        const notesService = await NotesService.fromMCPAuthInfo(authInfo);
        const notes = await notesService.getNotes();

        return {
          resources: notes.map(note => ({
            ...note,
            name: note.title || 'Untitled',
            uri: `notes://notes/${note.id}`,
            description: `${note.visibility} note - ${note.content.substring(0, 100)}${note.content.length > 100 ? '...' : ''}`,
            mimeType: 'text/markdown',
          })),
        };
      },
    }),
    async (uri, { id }, { authInfo }) => {
      const notesService = await NotesService.fromMCPAuthInfo(authInfo);
      const note = await notesService.getNoteById(id as string);

      return {
        contents: [
          {
            uri: uri.href,
            text: note ? JSON.stringify(note, null, 2) : 'NOT FOUND',
            mimeType: 'application/json',
          },
        ],
      };
    }
  );

  // Create a new note tool
  server.tool(
    'createNote',
    'Create a new note in the current organization',
    {
      title: z
        .string()
        .optional()
        .describe('Title of the note (optional, defaults to "Untitled")'),
      content: z
        .string()
        .optional()
        .describe('Content of the note in markdown format (optional)'),
      visibility: z
        .enum(['private', 'shared'])
        .optional()
        .describe(
          'Visibility of the note - private (only you can see) or shared (organization members can see). Defaults to private.'
        ),
      is_favorite: z
        .boolean()
        .optional()
        .describe(
          'Whether to mark this note as a favorite (optional, defaults to false)'
        ),
      tags: z
        .array(z.string())
        .optional()
        .describe('Array of tags to categorize the note (optional)'),
    },
    async ({ title, content, visibility, is_favorite, tags }, { authInfo }) => {
      const notesService = await NotesService.fromMCPAuthInfo(authInfo);
      const note = await notesService.createNote({
        title,
        content,
        visibility,
        is_favorite,
        tags,
      });

      server.sendResourceListChanged();
      return formatResponse('Note created successfully!', note);
    }
  );

  // Update an existing note tool
  server.tool(
    'updateNote',
    'Update an existing note by ID',
    {
      noteId: z.string().describe('ID of the note to update'),
      title: z
        .string()
        .optional()
        .describe('New title for the note (optional)'),
      content: z
        .string()
        .optional()
        .describe('New content for the note in markdown format (optional)'),
      visibility: z
        .enum(['private', 'shared'])
        .optional()
        .describe('New visibility setting for the note (optional)'),
      is_favorite: z
        .boolean()
        .optional()
        .describe('Whether to mark this note as a favorite (optional)'),
      tags: z
        .array(z.string())
        .optional()
        .describe('New array of tags for the note (optional)'),
    },
    async (
      { noteId, title, content, visibility, is_favorite, tags },
      { authInfo }
    ) => {
      const notesService = await NotesService.fromMCPAuthInfo(authInfo);
      const note = await notesService.updateNote(noteId, {
        title,
        content,
        visibility,
        is_favorite,
        tags,
      });

      server.sendResourceListChanged();
      return formatResponse('Note updated successfully!', note);
    }
  );

  // Delete a note tool
  server.tool(
    'deleteNote',
    'Delete a note by ID',
    {
      noteId: z.string().describe('ID of the note to delete'),
    },
    async ({ noteId }, { authInfo }) => {
      const notesService = await NotesService.fromMCPAuthInfo(authInfo);
      const success = await notesService.deleteNote(noteId);

      server.sendResourceListChanged();
      return formatResponse('Note deleted successfully!', {
        deleted: success,
        noteId,
      });
    }
  );

  // Get current user authentication info tool
  server.tool(
    'whoami',
    'Get current user authentication and session info',
    async ({ authInfo }) => {
      try {
        const notesService = await NotesService.fromMCPAuthInfo(authInfo);
        // Access the private sessionInfo through a simple getter
        const sessionInfo = (notesService as any).sessionInfo;

        return {
          content: [
            {
              type: 'text',
              text: `Current User Session Info:\\n${JSON.stringify(sessionInfo, null, 2)}`,
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Authentication Error: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // Authentication info tool
  server.tool(
    'userinfo',
    'Get current user authentication info',
    async ({ authInfo }) => {
      if (!authInfo?.token) {
        throw new Error('User not authenticated - no token available');
      }
      // Get OpenID Connect issuer and fetch userinfo
      let config = await discovery(
        new URL(process.env.STYTCH_DOMAIN as string),
        authInfo.clientId[0]
      );
      const userinfo = await fetchUserInfo(
        config,
        authInfo.token,
        authInfo.extra?.subject as string
      );

      return {
        content: [
          {
            type: 'text',
            text: `Notely UserInfo:\\n${JSON.stringify(userinfo, null, 2)}`,
          },
        ],
      };
    }
  );

  // Debug tool to inspect auth info
  server.tool(
    'debugAuth',
    'Debug tool to inspect the current authentication info structure',
    async ({ authInfo }) => {
      return {
        content: [
          {
            type: 'text',
            text: `Authentication Debug Info:\\n${JSON.stringify({
              hasToken: !!authInfo?.token,
              tokenLength: authInfo?.token?.length || 0,
              clientId: authInfo?.clientId || 'NOT_SET',
              scopes: authInfo?.scopes || 'NOT_SET',
              expiresAt: authInfo?.expiresAt || 'NOT_SET',
              extraKeys: authInfo?.extra ? Object.keys(authInfo.extra) : 'NOT_SET',
              subject: authInfo?.extra?.subject || 'NOT_SET',
              organization: authInfo?.extra?.organization || 'NOT_SET',
            }, null, 2)}`,
          },
        ],
      };
    }
  );

  // Get notes by tag tool
  server.tool(
    'getNotesByTag',
    'Get all notes that have a specific tag',
    {
      tag: z.string().describe('Tag to search for in notes'),
    },
    async ({ tag }, { authInfo }) => {
      const notesService = await NotesService.fromMCPAuthInfo(authInfo);
      const allNotes = await notesService.getNotes();
      const filteredNotes = allNotes.filter(
        note => note.tags && note.tags.includes(tag)
      );

      return formatResponse(
        `Found ${filteredNotes.length} notes with tag "${tag}"`,
        filteredNotes
      );
    }
  );

  // Search notes by content tool
  server.tool(
    'searchNotes',
    'Search notes by title or content using a search term',
    {
      searchTerm: z
        .string()
        .describe('Term to search for in note titles and content'),
      includePrivate: z
        .boolean()
        .optional()
        .describe(
          'Whether to include private notes in search (defaults to true)'
        ),
    },
    async ({ searchTerm, includePrivate = true }, { authInfo }) => {
      const notesService = await NotesService.fromMCPAuthInfo(authInfo);
      const allNotes = await notesService.getNotes();

      const filteredNotes = allNotes.filter(note => {
        if (!includePrivate && note.visibility === 'private') {
          return false;
        }

        const searchLower = searchTerm.toLowerCase();
        return (
          note.title.toLowerCase().includes(searchLower) ||
          note.content.toLowerCase().includes(searchLower)
        );
      });

      return formatResponse(
        `Found ${filteredNotes.length} notes matching "${searchTerm}"`,
        filteredNotes
      );
    }
  );
};
