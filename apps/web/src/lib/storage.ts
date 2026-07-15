import 'server-only';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

function storageDir(): string {
  return path.resolve(process.env.STORAGE_DIR ?? './storage');
}

/** Resolves a stored relative path, guarding against path traversal. */
function resolveArtifact(relPath: string): string {
  const root = storageDir();
  const full = path.resolve(root, relPath);
  if (full !== root && !full.startsWith(root + path.sep)) {
    throw new Error('invalid artifact path');
  }
  return full;
}

/**
 * Reads an artifact by its stored relative path, guarding against path
 * traversal (the resolved path must stay inside STORAGE_DIR).
 */
export async function readArtifact(relPath: string): Promise<Buffer> {
  return readFile(resolveArtifact(relPath));
}

/** Writes bytes to `<STORAGE_DIR>/<relPath>`, creating directories as needed. */
export async function writeArtifact(relPath: string, data: Buffer): Promise<string> {
  const full = resolveArtifact(relPath);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, data);
  return relPath;
}

/** Deletes an artifact; missing files are ignored. */
export async function deleteArtifact(relPath: string): Promise<void> {
  await rm(resolveArtifact(relPath), { force: true });
}
