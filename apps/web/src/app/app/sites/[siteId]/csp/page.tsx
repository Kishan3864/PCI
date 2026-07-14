import { cspReportOnlyHeader, planAllows } from '@scriptproof/core';
import { schema } from '@scriptproof/db';
import { desc, eq } from 'drizzle-orm';
import { ShieldAlert } from 'lucide-react';
import type { Metadata } from 'next';
import { CopyBlock } from '@/components/copy-block';
import { UpgradePrompt } from '@/components/upgrade-prompt';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Start collecting CSP reports</CardTitle>
          <CardDescription>
            Add this <code>Content-Security-Policy-Report-Only</code> header to your payment page.
            It does not block anything — it just reports what a policy <em>would</em> block, so you
            can build a safe allowlist before enforcing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <CopyBlock
            label="Content-Security-Policy-Report-Only"
            value={cspReportOnlyHeader(reportUri)}
          />
          <p className="text-xs text-slate-500">
            Reports are sent by the browser to <span className="font-mono">{reportUri}</span> and
            aggregated below.
          </p>
        </CardContent>
      </Card>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <ShieldAlert className="h-10 w-10 text-slate-300" />
            <p className="font-medium text-slate-700">No CSP reports yet</p>
            <p className="max-w-md text-sm text-slate-500">
              Once the header is live, blocked resources your policy would stop will appear here so
              you can decide what to allow.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
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
                  <TableCell className="max-w-md truncate font-mono text-xs" title={r.blockedUri}>
                    {r.blockedUri}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{r.violatedDirective}</TableCell>
                  <TableCell className="text-right font-medium">{r.count}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-slate-500">
                    {formatDateTime(r.lastSeen)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
