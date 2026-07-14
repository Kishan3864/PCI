import { parseCspReports } from '@scriptproof/core';
import { schema } from '@scriptproof/db';
import { eq, sql } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * CSP violation ingest (spec 5.4). Accepts both the legacy `application/csp-report`
 * body and the Reporting API array. Aggregates into csp_reports (upsert + count).
 * Always returns 204 so a misconfigured browser never sees an error.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteKey: string }> },
): Promise<NextResponse> {
  const { siteKey } = await params;

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const violations = parseCspReports(payload);
  if (violations.length === 0) return new NextResponse(null, { status: 204 });

  const site = await db.query.sites.findFirst({ where: eq(schema.sites.id, siteKey) });
  if (!site) return new NextResponse(null, { status: 204 });

  const now = new Date();
  for (const v of violations) {
    await db
      .insert(schema.cspReports)
      .values({
        siteId: site.id,
        blockedUri: v.blockedUri.slice(0, 1000),
        violatedDirective: v.violatedDirective.slice(0, 200),
        documentUri: v.documentUri.slice(0, 1000),
        count: 1,
        firstSeen: now,
        lastSeen: now,
      })
      .onConflictDoUpdate({
        target: [
          schema.cspReports.siteId,
          schema.cspReports.blockedUri,
          schema.cspReports.violatedDirective,
          schema.cspReports.documentUri,
        ],
        set: {
          count: sql`${schema.cspReports.count} + 1`,
          lastSeen: now,
        },
      });
  }

  return new NextResponse(null, { status: 204 });
}
