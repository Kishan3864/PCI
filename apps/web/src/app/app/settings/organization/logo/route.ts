import { NextResponse } from 'next/server';
import { requireOrg } from '@/lib/org';
import { readArtifact } from '@/lib/storage';

/**
 * Streams the caller's own org logo. STORAGE_DIR is never exposed publicly —
 * the file is resolved from the org row of the authenticated caller only.
 */
export async function GET(): Promise<NextResponse> {
  const { org } = await requireOrg();
  if (!org.logo) return new NextResponse('Not found', { status: 404 });

  try {
    const bytes = await readArtifact(org.logo);
    return new NextResponse(bytes as unknown as BodyInit, {
      headers: {
        'content-type': org.logo.endsWith('.png') ? 'image/png' : 'image/jpeg',
        'cache-control': 'private, no-store',
      },
    });
  } catch {
    return new NextResponse('File not available', { status: 404 });
  }
}
