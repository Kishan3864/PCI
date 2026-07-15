import { cspReportOnlyHeader, planAllows } from '@scriptproof/core';
import { schema } from '@scriptproof/db';
import { desc, eq } from 'drizzle-orm';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import { CopyBlock } from '@/components/copy-block';
import { UpgradePrompt } from '@/components/upgrade-prompt';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { GradientText, Reveal } from '@/components/visual';
import { db } from '@/lib/db';
import { appUrl } from '@/lib/env';
import { requireSite } from '@/lib/org';
import { formatDateTime } from '@/lib/utils';

export const metadata: Metadata = { title: 'CSP Insights' };

export default async function CspPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const { org, site } = await requireSite(siteId);

  if (!planAllows(org.plan, 'cspInsights')) {
    return <UpgradePrompt feature="CSP Insights" requiredPlan="Pro" />;
  }

  const reports = await db.query.cspReports.findMany({
    where: eq(schema.cspReports.siteId, site.id),
    orderBy: desc(schema.cspReports.count),
    limit: 200,
  });

  const reportUri = `${appUrl()}/api/ingest/csp/${site.id}`;

  const totalOccurrences = reports.reduce((sum, r) => sum + r.count, 0);
  const uniqueDirectives = [...new Set(reports.map((r) => r.violatedDirective))];
  const uniqueUris = new Set(reports.map((r) => r.blockedUri)).size;

  const stats = [
    { label: 'Reported violations', value: reports.length },
    { label: 'Total occurrences', value: totalOccurrences },
    { label: 'Directives hit', value: uniqueDirectives.length },
    { label: 'Distinct blocked URIs', value: uniqueUris },
  ];

  return (
    <div className="space-y-8">
      <Reveal>
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[2px] border border-blue-600/30 bg-blue-50 text-blue-600 shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-navy-900">
              CSP <GradientText>Insights</GradientText>
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
              Discover what a Content Security Policy would block on your checkout — safely, before
              you enforce it.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Start collecting CSP reports</CardTitle>
            <CardDescription>
              Add this <code className="text-blue-700">Content-Security-Policy-Report-Only</code>{' '}
              header to your payment page. It does not block anything — it just reports what a
              policy <em>would</em> block, so you can build a safe allowlist before enforcing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <CopyBlock
              label="Content-Security-Policy-Report-Only"
              value={cspReportOnlyHeader(reportUri)}
            />
            <p className="text-xs text-slate-500">
              Reports are sent by the browser to{' '}
              <span className="font-mono text-blue-700">{reportUri}</span> and aggregated below.
            </p>
          </CardContent>
        </Card>
      </Reveal>

      {reports.length === 0 ? (
        <Reveal delay={160}>
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-[2px] border border-blue-600/25 bg-blue-50 text-blue-600">
                <ShieldAlert className="h-7 w-7" />
              </div>
              <p className="font-medium text-navy-900">No CSP reports yet</p>
              <p className="max-w-md text-sm text-slate-600">
                Once the header is live, blocked resources your policy would stop will appear here
                so you can decide what to allow.
              </p>
            </CardContent>
          </Card>
        </Reveal>
      ) : (
        <Reveal delay={160}>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[2px] border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-1.5 font-display text-2xl font-bold tabular-nums text-blue-700">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-navy-900">Reported violations</h3>
              <Badge variant="brand">{reports.length}</Badge>
              <span className="mx-1 hidden h-4 w-px bg-slate-200 sm:block" />
              {uniqueDirectives.map((directive) => (
                <Badge key={directive} variant="secondary" className="font-mono normal-case">
                  {directive}
                </Badge>
              ))}
            </div>

            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Blocked URI</TableHead>
                    <TableHead>Directive</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                    <TableHead>Last seen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell
                        className="max-w-md truncate font-mono text-xs text-blue-700"
                        title={r.blockedUri}
                      >
                        {r.blockedUri}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono font-medium normal-case">
                          {r.violatedDirective}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums text-navy-900">
                        {r.count}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-slate-500">
                        {formatDateTime(r.lastSeen)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </Reveal>
      )}
    </div>
  );
}
