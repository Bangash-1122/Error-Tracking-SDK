import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema/index.js';

let client: postgres.Sql | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export interface DatabaseConfig {
  connectionString?: string;
  max?: number;
}

export function createDb(config?: DatabaseConfig) {
  if (client) {
    client.end().catch(() => {});
    client = null;
    dbInstance = null;
  }

  const connectionString = config?.connectionString || process.env.DATABASE_URL || 'postgres://postgres:postgres@127.0.0.1:5432/error_tracker';
  
  client = postgres(connectionString, {
    max: config?.max || 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  dbInstance = drizzle(client, { schema });
  return dbInstance;
}

export function getDb() {
  if (!dbInstance) {
    return createDb();
  }
  return dbInstance;
}

export function getClient(): postgres.Sql | null {
  return client;
}

export async function closeDb() {
  if (client) {
    try {
      await client.end({ timeout: 5 });
    } catch {
      // ignore errors on close
    } finally {
      client = null;
      dbInstance = null;
    }
  }
}

