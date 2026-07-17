import { planAllows } from '@scriptproof/core';
import { schema } from '@scriptproof/db';
import { and, asc, desc, eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireOrg } from '@/lib/org';
import { buildXlsx, xlsxFilename } from '@/lib/xlsx';

/** Streams the full script inventory as a styled XLSX. Agency plan only; ownership checked server-side. */
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

  const scripts = await db.query.scripts.findMany({
    where: eq(schema.scripts.siteId, site.id),
    orderBy: [asc(schema.scripts.status), desc(schema.scripts.lastSeenAt)],
  });

  const brand = planAllows(org.plan, 'whiteLabel') ? org.name : 'ScriptProof';
  const xlsx = await buildXlsx({
    brand,
    title: 'Script Inventory — PCI DSS 6.4.3',
    subtitle: `Site: ${site.domain} · ${scripts.length} scripts · Generated ${new Date().toISOString().replace('T', ' ').slice(0, 16)} UTC`,
    sheetName: 'Script Inventory',
    columns: [
      { header: 'Script URL', width: 60, wrap: true },
      { header: 'Status', width: 14, statusColors: true },
      { header: 'Business Justification', width: 40, wrap: true },
      { header: 'First Seen', width: 18, numFmt: 'yyyy-mm-dd hh:mm' },
      { header: 'Last Seen', width: 18, numFmt: 'yyyy-mm-dd hh:mm' },
      { header: 'SHA-256 Fingerprint', width: 36 },
      { header: 'Size (bytes)', width: 12 },
      { header: 'SRI Present', width: 12 },
      { header: 'Missing Streak', width: 14 },
    ],
    rows: scripts.map((s) => [
      s.srcUrl ?? s.urlKey,
      s.status,
      s.justification,
      s.firstSeenAt,
      s.lastSeenAt,
      s.latestSha256,
      s.latestByteSize,
      s.latestSriPresent === null ? null : s.latestSriPresent ? 'Yes' : 'No',
      s.missingStreak,
    ]),
  });

  return new NextResponse(xlsx as unknown as BodyInit, {
    headers: {
      'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'content-disposition': `attachment; filename="${xlsxFilename(site.domain, 'inventory')}"`,
      'cache-control': 'no-store',
    },
  });
}
