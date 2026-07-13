import { createDb, type Db } from '@scriptproof/db';

// One pool per server process, surviving dev hot-reloads.
const globalForDb = globalThis as unknown as { __scriptproofDb?: Db };

export const db: Db = globalForDb.__scriptproofDb ?? createDb().db;
globalForDb.__scriptproofDb = db;
