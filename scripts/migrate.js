const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
});

async function migrate() {
  try {
    console.log('Starting database migration...');

    // Create notes table
    await pool.query(`
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

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notes_member_org 
      ON notes(member_id, organization_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notes_org_visibility 
      ON notes(organization_id, visibility);
    `);

    console.log('Database tables and indexes created successfully!');

    // Insert sample data (you can customize these or remove them)
    const sampleNotes = [
      {
        title: 'Welcome to Your Team Notes',
        content: `# Welcome to Your Team Notes 🎉

This is your collaborative space for team notes and ideas.

## Getting Started

- Create **private notes** for your personal thoughts and drafts
- Create **shared notes** to collaborate with your team
- Use the lock/users icon to toggle between private and shared
- Star your favorite notes for quick access

## Features

- **Rich Markdown** support with tables, lists, and more
- **Real-time collaboration** on shared notes
- **Privacy controls** - keep notes private or share with team
- **Favorites** - star important notes for easy access
- **Tags** - organize your notes with custom tags

Happy note-taking! ✍️`,
        visibility: 'shared',
        is_favorite: true,
        tags: ['welcome', 'guide', 'team'],
      },
      {
        title: 'Getting Started Guide',
        content: `# Getting Started Guide

Welcome to our collaborative workspace! This guide will help you get up and running quickly.

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
        visibility: 'shared',
        is_favorite: false,
        tags: ['onboarding', 'guide'],
      },
      {
        title: 'My Private Notes',
        content: `# My Private Notes

This is a private note that only you can see.

## Personal Reminders

- [ ] Review team feedback
- [ ] Prepare for next sprint planning
- [ ] Update project documentation

## Ideas

- Consider implementing real-time collaboration
- Explore AI-powered note suggestions
- Add mobile app support

These are my personal thoughts and won't be shared with the team.`,
        visibility: 'private',
        is_favorite: true,
        tags: ['personal', 'reminders'],
      },
    ];

    console.log('\nSample notes available to insert:');
    sampleNotes.forEach((note, index) => {
      console.log(`${index + 1}. "${note.title}" (${note.visibility})`);
    });

    console.log(
      "\nTo insert sample notes, you'll need to run this script with specific member_id and organization_id values."
    );
    console.log(
      'Example: MEMBER_ID=mem_123 ORG_ID=org_456 node scripts/migrate.js'
    );

    // Check if we have member and org IDs to insert sample data
    const memberId = process.env.MEMBER_ID;
    const orgId = process.env.ORG_ID;

    if (memberId && orgId) {
      console.log(
        `\nInserting sample notes for member ${memberId} in organization ${orgId}...`
      );

      for (const note of sampleNotes) {
        await pool.query(
          `
          INSERT INTO notes (title, content, member_id, organization_id, visibility, is_favorite, tags)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
          [
            note.title,
            note.content,
            memberId,
            orgId,
            note.visibility,
            note.is_favorite,
            note.tags,
          ]
        );
      }

      console.log('Sample notes inserted successfully!');
    }

    console.log('\nMigration completed successfully! 🎉');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migration
if (require.main === module) {
  migrate();
}

module.exports = { migrate };
