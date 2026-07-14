import { schema } from '@scriptproof/db';
import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { readArtifact } from '@/lib/storage';

/** Email-gated download of the free-scan one-page PDF summary. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const row = await db.query.freeScans.findFirst({ where: eq(schema.freeScans.id, id) });

  // Gate: only after an email has been captured, and only when the PDF exists.
  if (!row || !row.email || row.status !== 'done') {
    return new NextResponse('Not available', { status: 403 });
  }
  const pdfPath =
    row.resultJson && typeof row.resultJson.pdfPath === 'string' ? row.resultJson.pdfPath : null;
  if (!pdfPath) return new NextResponse('Not found', { status: 404 });

  try {
    const pdf = await readArtifact(pdfPath);
    return new NextResponse(pdf as unknown as BodyInit, {
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': `attachment; filename="scriptproof-scan-${id}.pdf"`,
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
