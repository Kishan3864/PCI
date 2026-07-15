import { planAllows } from '@scriptproof/core';
import { schema } from '@scriptproof/db';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { csvFilename, toCsv } from '@/lib/csv';
import { db } from '@/lib/db';
import { requireOrg } from '@/lib/org';

/** Streams the full change timeline as CSV. Agency plan only; ownership checked server-side. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> },
): Promise<NextResponse> {
  const { siteId } = await params;
  const { org } = await requireOrg();

  const site = await db.query.sites.findFirst({
    where: and(eq(schema.sites.id, siteId), eq(schema.sites.orgId, org.id)),
  });
  if (!site) return new NextResponse('Not found', { status: 404 });

  if (!planAllows(org.plan, 'csvExport')) {
    return new NextResponse('CSV export is available on the Agency plan.', { status: 403 });
  }

  const sitePages = await db.query.pages.findMany({ where: eq(schema.pages.siteId, site.id) });
  const pagesById = new Map(sitePages.map((p) => [p.id, p]));

  const changes = sitePages.length
    ? await db.query.changes.findMany({
        where: inArray(
          schema.changes.pageId,
          sitePages.map((p) => p.id),
        ),
        orderBy: desc(schema.changes.detectedAt),
      })
    : [];

  const str = (v: unknown): string | null => (typeof v === 'string' ? v : null);

  const csv = toCsv(
    [
      'detected_at',
      'page',
      'severity',
      'type',
      'script_url',
      'before_hash',
      'after_hash',
      'acknowledged_at',
    ],
    changes.map((c) => [
      c.detectedAt,
      pagesById.get(c.pageId)?.url,
      c.severity,
      c.type,
      str(c.detail.srcUrl) ?? str(c.detail.urlKey),
      str(c.detail.before),
      str(c.detail.after) ?? (c.type === 'new_script' ? str(c.detail.sha256) : null),
      c.acknowledgedAt,
    ]),
  );

  return new NextResponse(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${csvFilename(site.domain, 'changes')}"`,
      'cache-control': 'no-store',
    },
  });
}
