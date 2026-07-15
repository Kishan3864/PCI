import { TRACKED_HEADERS } from '@scriptproof/core';
import { schema } from '@scriptproof/db';
import { and, desc, eq } from 'drizzle-orm';
import { FileWarning, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GradientText, Reveal } from '@/components/visual';
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
    <div className="space-y-8">
      <Reveal>
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Security <GradientText>headers</GradientText>
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-400">
            The full HTTP response header set of every scan is stored for your 11.6.1 evidence. The
            six security-relevant headers below are actively monitored for changes.
          </p>
        </div>
      </Reveal>

      {withData.length === 0 ? (
        <Reveal delay={80}>
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-[2px] bg-cyan-400/10 text-cyan-300 ring-1 ring-inset ring-cyan-400/30">
                <FileWarning className="h-6 w-6" />
              </div>
              <p className="font-semibold text-white">No header snapshots yet</p>
              <p className="text-sm text-slate-500">Run a scan to capture response headers.</p>
            </CardContent>
          </Card>
        </Reveal>
      ) : (
        withData.map(({ page, scan, snapshot }, i) => (
          <Reveal key={page.id} delay={Math.min(i, 6) * 70}>
            <Card>
              <CardHeader className="flex-row items-start gap-3 space-y-0">
                <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-[2px] bg-cyan-400/10 text-cyan-300 ring-1 ring-inset ring-cyan-400/30">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="min-w-0 space-y-1.5">
                  <CardTitle className="text-base">{page.label}</CardTitle>
                  <CardDescription className="break-all">
                    {page.url} · captured {formatDateTime(scan?.finishedAt ?? null)}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <dl className="divide-y divide-slate-400/10 overflow-hidden rounded-[2px] bg-surface-900/70 ring-1 ring-inset ring-slate-400/15">
                  {TRACKED_HEADERS.map((header) => {
                    const value = snapshot?.headersJson[header];
                    return (
                      <div
                        key={header}
                        className="flex flex-wrap items-baseline gap-2 px-3 py-2.5 text-sm"
                      >
                        <dt className="w-72 shrink-0 font-mono text-xs font-medium text-slate-500">
                          {header}
                        </dt>
                        <dd className="min-w-0 flex-1 break-all font-mono text-xs text-slate-300">
                          {value ?? <Badge variant="warning">missing</Badge>}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
                <details className="mt-4">
                  <summary className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-cyan-400 transition-colors hover:text-cyan-300">
                    All {Object.keys(snapshot?.headersJson ?? {}).length} response headers
                  </summary>
                  <dl className="mt-3 space-y-1 rounded-[2px] bg-surface-900/70 p-3 ring-1 ring-inset ring-slate-400/15">
                    {Object.entries(snapshot?.headersJson ?? {})
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([name, value]) => (
                        <div key={name} className="flex flex-wrap gap-2 text-xs">
                          <dt
                            className={`w-72 shrink-0 font-mono ${tracked.has(name) ? 'font-semibold text-cyan-300' : 'text-slate-500'}`}
                          >
                            {name}
                          </dt>
                          <dd className="min-w-0 flex-1 break-all font-mono text-slate-300">
                            {value}
                          </dd>
                        </div>
                      ))}
                  </dl>
                </details>
              </CardContent>
            </Card>
          </Reveal>
        ))
      )}
    </div>
  );
}
