import { schema } from '@scriptproof/db';
import { and, eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireOrg } from '@/lib/org';
import { readArtifact } from '@/lib/storage';

/** Streams an Evidence Pack PDF after verifying it belongs to the caller's org. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string; reportId: string }> },
): Promise<NextResponse> {
  const { siteId, reportId } = await params;
  const { org } = await requireOrg();

  const report = await db.query.evidenceReports.findFirst({
    where: and(
      eq(schema.evidenceReports.id, reportId),
      eq(schema.evidenceReports.siteId, siteId),
      eq(schema.evidenceReports.orgId, org.id),
    ),
  });
  if (!report) return new NextResponse('Not found', { status: 404 });

  try {
    const pdf = await readArtifact(report.pdfPath);
    return new NextResponse(pdf as unknown as BodyInit, {
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': `attachment; filename="evidence-${siteId}.pdf"`,
      },
    });
  } catch {
    return new NextResponse('File not available', { status: 404 });
  }
}
