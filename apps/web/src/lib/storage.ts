import 'server-only';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
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

function storageDir(): string {
  const configured = process.env.STORAGE_DIR ?? './storage';
  return path.isAbsolute(configured) ? configured : path.resolve(workspaceRoot(), configured);
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
