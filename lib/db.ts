import { Pool } from 'pg';

const isProd = process.env.NODE_ENV === 'production';

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super('Database is not configured. Set DATABASE_URL to enable notes.');
    this.name = 'DatabaseNotConfiguredError';
  }
}

// Database connection pool for Neon PostgreSQL
let pool: Pool | null = null;

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb(): Pool {
  if (!isDatabaseConfigured()) {
    throw new DatabaseNotConfiguredError();
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isProd ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
}

// Initialize database tables if they don't exist
export async function initializeDatabase(): Promise<void> {
  if (!isDatabaseConfigured()) {
    throw new DatabaseNotConfiguredError();
  }

  const db = getDb();

  try {
    // Create notes table
    await db.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL DEFAULT 'Untitled',
        content TEXT NOT NULL DEFAULT '',
        member_id TEXT NOT NULL,
        organization_id TEXT NOT NULL,
        visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'shared')),
        is_favorite BOOLEAN NOT NULL DEFAULT false,
        tags TEXT[] DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    // Create index for better query performance
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_notes_member_org 
      ON notes(member_id, organization_id);
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_notes_org_visibility 
      ON notes(organization_id, visibility);
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Updated Note interface to match database schema
export interface DatabaseNote {
  id: string;
  title: string;
  content: string;
  member_id: string;
  organization_id: string;
  visibility: 'private' | 'shared';
  is_favorite: boolean;
  tags: string[];
  created_at: Date;
  updated_at: Date;
}

// Helper to convert database row to Note object
export function dbRowToNote(row: any): DatabaseNote {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    member_id: row.member_id,
    organization_id: row.organization_id,
    visibility: row.visibility,
    is_favorite: row.is_favorite,
    tags: row.tags || [],
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  };
}
