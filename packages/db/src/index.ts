import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export * from './schema';
export { schema };
export { loadRootEnv } from './env';

export type Db = NodePgDatabase<typeof schema>;

export interface CreateDbResult {
  db: Db;
  pool: Pool;
}

export function createDb(connectionString?: string): CreateDbResult {
  const url = connectionString ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }
  const pool = new Pool({ connectionString: url });
  const db = drizzle(pool, { schema });
  return { db, pool };
}
