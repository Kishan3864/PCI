import { TRACKED_HEADERS } from '@scriptproof/core';
import { schema } from '@scriptproof/db';
import { and, desc, eq } from 'drizzle-orm';
import { FileWarning } from 'lucide-react';
import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/db';
import { requireSite } from '@/lib/org';
import { formatDateTime } from '@/lib/utils';

export const metadata: Metadata = { title: 'Headers' };

const tracked = new Set<string>(TRACKED_HEADERS);

export default async function HeadersPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const { site } = await requireSite(siteId);

  const sitePages = await db.query.pages.findMany({ where: eq(schema.pages.siteId, site.id) });

  const snapshots = await Promise.all(
    sitePages.map(async (page) => {
      const scan = await db.query.scans.findFirst({
        where: and(eq(schema.scans.pageId, page.id), eq(schema.scans.status, 'success')),
        orderBy: desc(schema.scans.startedAt),
        with: { headerSnapshots: true },
      });
      return { page, scan, snapshot: scan?.headerSnapshots[0] ?? null };
    }),
  );

  const withData = snapshots.filter((s) => s.snapshot);

  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-sm leading-6 text-slate-600">
        The full HTTP response header set of every scan is stored for your 11.6.1 evidence. The six
        security-relevant headers below are actively monitored for changes.
      </p>

      {withData.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <FileWarning className="h-10 w-10 text-slate-300" />
            <p className="font-medium text-slate-700">No header snapshots yet</p>
            <p className="text-sm text-slate-500">Run a scan to capture response headers.</p>
          </CardContent>
        </Card>
      ) : (
        withData.map(({ page, scan, snapshot }) => (
          <Card key={page.id}>
            <CardHeader>
              <CardTitle className="text-base">{page.label}</CardTitle>
              <CardDescription>
                {page.url} · captured {formatDateTime(scan?.finishedAt ?? null)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                {TRACKED_HEADERS.map((header) => {
                  const value = snapshot?.headersJson[header];
                  return (
                    <div key={header} className="flex flex-wrap items-baseline gap-2 text-sm">
                      <dt className="w-72 shrink-0 font-mono text-xs text-slate-500">{header}</dt>
                      <dd className="min-w-0 flex-1 break-all font-mono text-xs">
                        {value ?? <Badge variant="warning">missing</Badge>}
                      </dd>
                    </div>
                  );
                })}
              </dl>
              <details className="mt-4">
                <summary className="cursor-pointer text-xs font-medium text-slate-500">
                  All {Object.keys(snapshot?.headersJson ?? {}).length} response headers
                </summary>
                <dl className="mt-2 space-y-1 rounded-md bg-slate-50 p-3">
                  {Object.entries(snapshot?.headersJson ?? {})
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([name, value]) => (
                      <div key={name} className="flex flex-wrap gap-2 text-xs">
                        <dt
                          className={`w-72 shrink-0 font-mono ${tracked.has(name) ? 'font-semibold text-navy-800' : 'text-slate-500'}`}
                        >
                          {name}
                        </dt>
                        <dd className="min-w-0 flex-1 break-all font-mono text-slate-700">
                          {value}
                        </dd>
                      </div>
                    ))}
                </dl>
              </details>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
