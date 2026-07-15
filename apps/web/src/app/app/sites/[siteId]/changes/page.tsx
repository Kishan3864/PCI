import { CHANGE_TYPE_LABELS } from '@scriptproof/email';
import { schema } from '@scriptproof/db';
import { desc, eq, inArray } from 'drizzle-orm';
import { History } from 'lucide-react';
import type { Metadata } from 'next';
import { ActionButton } from '@/components/action-button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { GradientText, Reveal } from '@/components/visual';
import { acknowledgeChange } from '@/actions/changes';
import { db } from '@/lib/db';
import { requireSite } from '@/lib/org';
import { formatDateTime, shortHash } from '@/lib/utils';

export const metadata: Metadata = { title: 'Changes' };

const severityVariant = { info: 'info', warning: 'warning', critical: 'critical' } as const;

function changeSummary(type: string, detail: Record<string, unknown>): string {
  const src = typeof detail.srcUrl === 'string' ? detail.srcUrl : null;
  switch (type) {
    case 'new_script':
      return src ?? `inline script ${shortHash((detail.sha256 as string) ?? null)}`;
    case 'script_modified':
      return `${src ?? 'script'} — ${shortHash((detail.before as string) ?? null)} → ${shortHash(
        (detail.after as string) ?? null,
      )}`;
    case 'script_removed':
      return `${(detail.urlKey as string) ?? 'script'} missing for ${String(detail.missedScans ?? 3)} consecutive scans`;
    case 'sri_removed':
      return src ?? 'script';
    case 'header_changed': {
      const header = (detail.header as string) ?? 'header';
      const kind = (detail.kind as string) ?? 'modified';
      return `${header} ${kind}`;
    }
    default:
      return '';
  }
}

export default async function ChangesPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const { site } = await requireSite(siteId);

  const sitePages = await db.query.pages.findMany({ where: eq(schema.pages.siteId, site.id) });
  const pagesById = new Map(sitePages.map((p) => [p.id, p]));

  const changes = sitePages.length
    ? await db.query.changes.findMany({
        where: inArray(
          schema.changes.pageId,
          sitePages.map((p) => p.id),
        ),
        orderBy: desc(schema.changes.detectedAt),
        limit: 200,
      })
    : [];

  const railColor = {
    info: 'bg-sky-400',
    warning: 'bg-amber-400',
    critical: 'bg-rose-500',
  } as const;

  return (
    <div className="space-y-8">
      <Reveal>
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Change <GradientText>timeline</GradientText>
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-400">
            Every new, modified or removed script and every security-header change detected on your
            pages — the tamper-detection trail behind requirement 11.6.1.
          </p>
        </div>
      </Reveal>

      {changes.length === 0 ? (
        <Reveal delay={80}>
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-[2px] bg-cyan-400/10 text-cyan-300 ring-1 ring-inset ring-cyan-400/30">
                <History className="h-6 w-6" />
              </div>
              <p className="font-semibold text-white">No changes detected</p>
              <p className="max-w-md text-sm leading-6 text-slate-500">
                After the baseline scan, every new, modified or removed script and every security
                header change on your pages shows up here.
              </p>
            </CardContent>
          </Card>
        </Reveal>
      ) : (
        <ol className="space-y-3">
          {changes.map((change, i) => {
            const page = pagesById.get(change.pageId);
            return (
              <li key={change.id}>
                <Reveal delay={Math.min(i, 8) * 60}>
                  <Card
                    className={`card-lift overflow-hidden ${change.acknowledgedAt ? 'opacity-70' : ''}`}
                  >
                    <CardContent className="flex flex-wrap items-start justify-between gap-4 p-0">
                      <div
                        aria-hidden
                        className={`w-1 self-stretch ${railColor[change.severity]}`}
                      />
                      <div className="min-w-0 flex-1 space-y-1.5 py-4 pr-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={severityVariant[change.severity]}>
                            {change.severity}
                          </Badge>
                          <span className="font-semibold text-white">
                            {CHANGE_TYPE_LABELS[change.type] ?? change.type}
                          </span>
                          <span className="text-xs text-slate-500">
                            {page ? `${page.label} · ${page.url}` : ''}
                          </span>
                        </div>
                        <p className="break-all rounded-[2px] bg-surface-900/70 px-3 py-2 font-mono text-xs text-slate-300 ring-1 ring-inset ring-slate-400/15">
                          {changeSummary(change.type, change.detail)}
                        </p>
                        <p className="text-xs text-slate-500">
                          Detected {formatDateTime(change.detectedAt)}
                          {change.acknowledgedAt
                            ? ` · acknowledged ${formatDateTime(change.acknowledgedAt)}`
                            : ''}
                        </p>
                      </div>
                      {!change.acknowledgedAt ? (
                        <div className="py-4 pr-4">
                          <ActionButton
                            action={acknowledgeChange}
                            fields={{ changeId: change.id }}
                            variant="outline"
                            size="sm"
                          >
                            Acknowledge
                          </ActionButton>
                        </div>
                      ) : (
                        <div className="py-4 pr-4">
                          <Badge variant="secondary">acknowledged</Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Reveal>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
