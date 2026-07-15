import { planAllows } from '@scriptproof/core';
import { schema } from '@scriptproof/db';
import { and, asc, desc, eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { csvFilename, toCsv } from '@/lib/csv';
import { db } from '@/lib/db';
import { requireOrg } from '@/lib/org';

/** Streams the full script inventory as CSV. Agency plan only; ownership checked server-side. */
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

  const scripts = await db.query.scripts.findMany({
    where: eq(schema.scripts.siteId, site.id),
    orderBy: [asc(schema.scripts.status), desc(schema.scripts.lastSeenAt)],
  });

  const csv = toCsv(
    [
      'url',
      'status',
      'justification',
      'first_seen',
      'last_seen',
      'sha256',
      'byte_size',
      'sri_present',
      'missing_streak',
    ],
    scripts.map((s) => [
      s.srcUrl ?? s.urlKey,
      s.status,
      s.justification,
      s.firstSeenAt,
      s.lastSeenAt,
      s.latestSha256,
      s.latestByteSize,
      s.latestSriPresent,
      s.missingStreak,
    ]),
  );

  return new NextResponse(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${csvFilename(site.domain, 'inventory')}"`,
      'cache-control': 'no-store',
    },
  });
}
