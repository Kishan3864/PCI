import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

/** Root directory for generated artifacts (Evidence Pack PDFs). */
export function storageDir(): string {
  return path.resolve(process.env.STORAGE_DIR ?? './storage');
}

/**
 * Writes bytes to `<STORAGE_DIR>/<relPath>`, creating directories as needed.
 * Returns the relative path (stored in the DB; resolved against STORAGE_DIR on read).
 */
export async function writeArtifact(relPath: string, data: Buffer): Promise<string> {
  const full = path.join(storageDir(), relPath);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, data);
  return relPath;
}
