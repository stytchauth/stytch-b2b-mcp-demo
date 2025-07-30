import { initializeDatabase, getDb } from '../lib/db.js';
import { fileURLToPath } from 'url';
import { resolve } from 'path';

async function migrate() {
  try {
    console.log('Starting database migration...');

    // Use the shared database initialization function
    await initializeDatabase();

    console.log('\nMigration completed successfully! 🎉');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    // Close the database connection pool
    const pool = getDb();
    await pool.end();
  }
}

// Run migration
if (resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1])) {
  migrate();
}

export { migrate };
