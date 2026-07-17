import { planAllows } from '@scriptproof/core';
import { schema } from '@scriptproof/db';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireOrg } from '@/lib/org';
import { buildXlsx, xlsxFilename } from '@/lib/xlsx';

/** Streams the full change timeline as a styled XLSX. Agency plan only; ownership checked server-side. */
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
    return new NextResponse('Export is available on the Agency plan.', { status: 403 });
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

  const brand = planAllows(org.plan, 'whiteLabel') ? org.name : 'ScriptProof';
  const xlsx = await buildXlsx({
    brand,
    title: 'Change Log — PCI DSS 11.6.1',
    subtitle: `Site: ${site.domain} · ${changes.length} changes · Generated ${new Date().toISOString().replace('T', ' ').slice(0, 16)} UTC`,
    sheetName: 'Change Log',
    columns: [
      { header: 'Detected At', width: 18, numFmt: 'yyyy-mm-dd hh:mm' },
      { header: 'Page', width: 45, wrap: true },
      { header: 'Severity', width: 12, statusColors: true },
      { header: 'Change Type', width: 22 },
      { header: 'Script URL', width: 55, wrap: true },
      { header: 'Hash Before', width: 36 },
      { header: 'Hash After', width: 36 },
      { header: 'Acknowledged At', width: 18, numFmt: 'yyyy-mm-dd hh:mm' },
    ],
    rows: changes.map((c) => [
      c.detectedAt,
      pagesById.get(c.pageId)?.url,
      c.severity,
      c.type,
      str(c.detail.srcUrl) ?? str(c.detail.urlKey),
      str(c.detail.before),
      str(c.detail.after) ?? (c.type === 'new_script' ? str(c.detail.sha256) : null),
      c.acknowledgedAt,
    ]),
  });

  return new NextResponse(xlsx as unknown as BodyInit, {
    headers: {
      'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'content-disposition': `attachment; filename="${xlsxFilename(site.domain, 'changes')}"`,
      'cache-control': 'no-store',
    },
  });
}
