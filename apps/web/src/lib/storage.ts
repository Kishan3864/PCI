import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

function storageDir(): string {
  return path.resolve(process.env.STORAGE_DIR ?? './storage');
}

/**
 * Reads an artifact by its stored relative path, guarding against path
 * traversal (the resolved path must stay inside STORAGE_DIR).
 */
export async function readArtifact(relPath: string): Promise<Buffer> {
  const root = storageDir();
  const full = path.resolve(root, relPath);
  if (full !== root && !full.startsWith(root + path.sep)) {
    throw new Error('invalid artifact path');
  }
  return readFile(full);
}
