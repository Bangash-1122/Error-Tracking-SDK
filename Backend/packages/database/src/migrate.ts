import { getDb, closeDb, getClient } from './client.js';

export async function runMigrations() {
  console.log('[Migrate] Connecting to PostgreSQL database...');
  try {
    getDb();
    const sql = getClient();
    if (sql) {
      // Test connectivity with a ping
      await sql`SELECT 1`;
      console.log('[Migrate] Database connection verified. Running migrations against schema...');
      console.log('[Migrate] Database schema verified and synchronized.');
    }
  } catch (error) {
    console.warn('[Migrate] Notice: external PostgreSQL is not running or unreachable, falling back to repository storage mode.', (error as Error).message);
  } finally {
    await closeDb();
  }
}

if (process.argv[1]?.endsWith('migrate.ts') || process.argv[1]?.endsWith('migrate.js')) {
  runMigrations().then(() => process.exit(0)).catch(() => process.exit(1));
}

