import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as tables from './schema';
import * as tableRelations from './relations';

const schema = { ...tables, ...tableRelations };

export * from './schema';
export * from './relations';
export { schema };
export { loadRootEnv } from './env';

export type Db = NodePgDatabase<typeof schema>;

export interface CreateDbResult {
  db: Db;
  pool: Pool;
}

export function createPool(connectionString?: string): Pool {
  const url = connectionString ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }
  return new Pool({ connectionString: url });
}

/**
 * Wraps an existing pool in a drizzle client. Callers that cache across dev
 * hot-reloads must cache the POOL, not this client — a cached client keeps
 * the schema it was built with, so newly added tables would be missing from
 * `db.query.*` until the process restarts.
 */
export function createDbFromPool(pool: Pool): Db {
  return drizzle(pool, { schema });
}

export function createDb(connectionString?: string): CreateDbResult {
  const pool = createPool(connectionString);
  return { db: createDbFromPool(pool), pool };
}

export type { Pool };
