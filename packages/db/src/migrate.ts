import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { loadRootEnv } from './env';
import { createDb } from './index';

loadRootEnv();

const migrationsFolder = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../drizzle');

const { db, pool } = createDb();
try {
  await migrate(db, { migrationsFolder });
  console.log('Migrations applied.');
} finally {
  await pool.end();
}
