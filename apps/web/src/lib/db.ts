import { createDbFromPool, createPool, type Db, type Pool } from '@scriptproof/db';

// One pool per server process, surviving dev hot-reloads. The drizzle client
// itself is rebuilt on each reload so schema changes (new tables) show up in
// `db.query.*` without a server restart.
const globalForDb = globalThis as unknown as { __scriptproofPool?: Pool };

const pool: Pool = globalForDb.__scriptproofPool ?? createPool();
globalForDb.__scriptproofPool = pool;

export const db: Db = createDbFromPool(pool);
