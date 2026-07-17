import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * A relative STORAGE_DIR must resolve against the monorepo root, not the
 * process CWD — web and worker start from different workspace directories,
 * and each resolving `./storage` locally would split artifacts across two
 * folders (worker writes a PDF the web app then can't find).
 */
function workspaceRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 5; i += 1) {
    if (existsSync(path.join(dir, 'pnpm-workspace.yaml'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

/** Root directory for generated artifacts (Evidence Pack PDFs). */
export function storageDir(): string {
  const configured = process.env.STORAGE_DIR ?? './storage';
  return path.isAbsolute(configured) ? configured : path.resolve(workspaceRoot(), configured);
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
