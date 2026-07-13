import { CHANGE_TYPE_LABELS } from '@scriptproof/email';
import { schema } from '@scriptproof/db';
import { desc, eq, inArray } from 'drizzle-orm';
import { History } from 'lucide-react';
import type { Metadata } from 'next';
import { ActionButton } from '@/components/action-button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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

  return (
    <div className="space-y-4">
      {changes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <History className="h-10 w-10 text-slate-300" />
            <p className="font-medium text-slate-700">No changes detected</p>
            <p className="max-w-md text-sm text-slate-500">
              After the baseline scan, every new, modified or removed script and every security
              header change on your pages shows up here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ol className="space-y-3">
          {changes.map((change) => {
            const page = pagesById.get(change.pageId);
            return (
              <li key={change.id}>
                <Card className={change.acknowledgedAt ? 'opacity-70' : ''}>
                  <CardContent className="flex flex-wrap items-start justify-between gap-4 p-4">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={severityVariant[change.severity]}>{change.severity}</Badge>
                        <span className="font-medium text-navy-900">
                          {CHANGE_TYPE_LABELS[change.type] ?? change.type}
                        </span>
                        <span className="text-xs text-slate-500">
                          {page ? `${page.label} · ${page.url}` : ''}
                        </span>
                      </div>
                      <p className="break-all font-mono text-xs text-slate-600">
                        {changeSummary(change.type, change.detail)}
                      </p>
                      <p className="text-xs text-slate-400">
                        Detected {formatDateTime(change.detectedAt)}
                        {change.acknowledgedAt
                          ? ` · acknowledged ${formatDateTime(change.acknowledgedAt)}`
                          : ''}
                      </p>
                    </div>
                    {!change.acknowledgedAt ? (
                      <ActionButton
                        action={acknowledgeChange}
                        fields={{ changeId: change.id }}
                        variant="outline"
                        size="sm"
                      >
                        Acknowledge
                      </ActionButton>
                    ) : null}
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
