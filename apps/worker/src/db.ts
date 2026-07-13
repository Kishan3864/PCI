import { createDb } from '@scriptproof/db';
import './env';

export const { db, pool } = createDb();
