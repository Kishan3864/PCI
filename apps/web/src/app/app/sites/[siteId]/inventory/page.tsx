import { planAllows } from '@scriptproof/core';
import { schema } from '@scriptproof/db';
import { asc, desc, eq } from 'drizzle-orm';
import { Download, Fingerprint, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import { ActionButton } from '@/components/action-button';
import { JustifyDialog } from '@/components/justify-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { GradientText, Reveal } from '@/components/visual';
import { scanNow } from '@/actions/sites';
import { db } from '@/lib/db';
import { requireSite } from '@/lib/org';
import { formatDateTime, shortHash } from '@/lib/utils';

export const metadata: Metadata = { title: 'Script inventory' };

const statusVariant = { pending: 'warning', authorized: 'success', blocked: 'critical' } as const;

export default async function InventoryPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const { site, org } = await requireSite(siteId);
  const canExportCsv = planAllows(org.plan, 'csvExport');

  const scripts = await db.query.scripts.findMany({
    where: eq(schema.scripts.siteId, site.id),
    orderBy: [asc(schema.scripts.status), desc(schema.scripts.lastSeenAt)],
  });

  const pendingCount = scripts.filter((s) => s.status === 'pending').length;

  return (
    <div className="space-y-5">
      <Reveal>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[2px] bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-600/20">
              <Fingerprint className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold tracking-tight text-navy-900">
                Script <GradientText>inventory</GradientText>
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {scripts.length} script{scripts.length === 1 ? '' : 's'} fingerprinted with SHA-256
                {pendingCount > 0 ? (
                  <span className="ml-2 inline-flex items-center gap-1 font-medium text-amber-700">
                    · {pendingCount} awaiting review
                  </span>
                ) : null}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {canExportCsv ? (
              <Button asChild variant="outline" size="sm">
                <a href={`/app/sites/${site.id}/inventory/export`} download>
                  <Download className="h-4 w-4" /> Export CSV
                </a>
              </Button>
            ) : (
              <span className="text-xs text-slate-400">CSV export — Agency plan</span>
            )}
            {site.verifiedAt ? (
              <ActionButton
                action={scanNow}
                fields={{ siteId: site.id }}
                showResult
                variant="outline"
              >
                Scan now
              </ActionButton>
            ) : null}
          </div>
        </div>
      </Reveal>

      {scripts.length === 0 ? (
        <Reveal delay={80}>
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-[2px] bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.6)]">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <p className="font-semibold text-navy-900">No scripts recorded yet</p>
              <p className="max-w-md text-sm leading-6 text-slate-500">
                {site.verifiedAt
                  ? 'Run a scan to build the baseline inventory. Every script found gets status "pending" until you review it.'
                  : 'Verify the domain first — the baseline scan runs automatically afterwards.'}
              </p>
            </CardContent>
          </Card>
        </Reveal>
      ) : (
        <Reveal delay={80}>
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Script</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>SRI</TableHead>
                  <TableHead>Current hash</TableHead>
                  <TableHead>Last seen</TableHead>
                  <TableHead>Justification</TableHead>
                  <TableHead className="text-right">Review</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scripts.map((script) => {
                  const name = script.srcUrl ?? `inline script (${shortHash(script.latestSha256)})`;
                  return (
                    <TableRow key={script.id}>
                      <TableCell className="max-w-xs">
                        <span
                          className="block truncate font-mono text-xs text-slate-700"
                          title={name}
                        >
                          {script.runtimeSeen ? (
                            <Badge variant="info" className="mr-1.5">
                              runtime
                            </Badge>
                          ) : null}
                          {script.isInline ? (
                            <>
                              <Badge variant="secondary" className="mr-1.5">
                                inline
                              </Badge>
                              {shortHash(script.latestSha256)}
                            </>
                          ) : (
                            script.srcUrl
                          )}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[script.status]}>{script.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {script.isInline ? (
                          <span className="text-slate-500">n/a</span>
                        ) : script.latestSriPresent ? (
                          <Badge variant="success">yes</Badge>
                        ) : (
                          <span className="text-slate-500">no</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">
                        {shortHash(script.latestSha256)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-slate-500">
                        {formatDateTime(script.lastSeenAt)}
                      </TableCell>
                      <TableCell className="max-w-[16rem]">
                        {script.justification ? (
                          <span
                            className="block truncate text-xs text-slate-600"
                            title={script.justification}
                          >
                            {script.justification}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {script.status !== 'authorized' ? (
                            <JustifyDialog
                              scriptId={script.id}
                              scriptName={name}
                              action="authorized"
                            />
                          ) : null}
                          {script.status !== 'blocked' ? (
                            <JustifyDialog
                              scriptId={script.id}
                              scriptName={name}
                              action="blocked"
                            />
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </Reveal>
      )}
    </div>
  );
}
