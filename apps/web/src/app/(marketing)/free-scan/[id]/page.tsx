import type { FreeScanReport } from '@scriptproof/core';
import { schema } from '@scriptproof/db';
import { eq } from 'drizzle-orm';
import { CheckCircle2, Loader2, Lock, XCircle } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FreeScanEmailGate } from '@/components/free-scan-email-gate';
import { PollRefresh } from '@/components/poll-refresh';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/db';

export const metadata: Metadata = { title: 'Scan results' };

export default async function FreeScanResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await db.query.freeScans.findFirst({ where: eq(schema.freeScans.id, id) });
  if (!row) notFound();

  if (row.status === 'queued' || row.status === 'running') {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <PollRefresh />
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-navy-600" />
        <h1 className="mt-4 text-2xl font-bold text-navy-900">Scanning your page…</h1>
        <p className="mt-2 break-all font-mono text-sm text-slate-500">{row.url}</p>
        <p className="mt-4 text-sm text-slate-500">
          This usually takes under a minute. The page will update automatically.
        </p>
      </div>
    );
  }

  if (row.status === 'error') {
    const message =
      row.resultJson && typeof row.resultJson.error === 'string'
        ? row.resultJson.error
        : 'We could not scan that page.';
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <XCircle className="mx-auto h-10 w-10 text-red-600" />
        <h1 className="mt-4 text-2xl font-bold text-navy-900">Scan failed</h1>
        <p className="mt-2 text-slate-600">{message}</p>
        <Button className="mt-6" asChild>
          <Link href="/free-scan">Try another URL</Link>
        </Button>
      </div>
    );
  }

  const report = row.resultJson as unknown as FreeScanReport;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm font-medium text-emerald-700">Scan complete</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight text-navy-900">Scan results</h1>
      <p className="mt-2 break-all font-mono text-sm text-slate-500">{report.url}</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat n={report.scriptCount} label="Scripts" />
        <Stat n={report.externalDomains.length} label="External domains" />
        <Stat
          n={report.scriptsWithoutSri}
          label="Without SRI"
          tone={report.scriptsWithoutSri > 0 ? 'warn' : 'ok'}
        />
        <Stat
          n={`${report.headersPresent}/${report.headersTotal}`}
          label="Security headers"
          tone={report.headersPresent < report.headersTotal ? 'warn' : 'ok'}
        />
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base">Security headers</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {report.securityHeaders.map((h) => (
              <li key={h.header} className="flex items-center gap-2">
                {h.present ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="font-mono text-xs">{h.header}</span>
                {!h.present ? <Badge variant="warning">missing</Badge> : null}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">External script domains</CardTitle>
        </CardHeader>
        <CardContent>
          {report.externalDomains.length === 0 ? (
            <p className="text-sm text-slate-500">No external script domains found.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {report.externalDomains.map((d) => (
                <li key={d} className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs">
                  {d}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Blurred "changes over time" teaser — the paid capability. */}
      <Card className="relative mt-6 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">Changes over time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="pointer-events-none select-none space-y-2 blur-sm" aria-hidden>
            <div className="flex justify-between text-sm">
              <span>New script on checkout — cdn.tracker.example/x.js</span>
              <span className="text-red-600">critical</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>checkout.js content changed</span>
              <span className="text-red-600">critical</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Content-Security-Policy weakened</span>
              <span className="text-amber-600">warning</span>
            </div>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/60 text-center">
            <Lock className="h-6 w-6 text-navy-600" />
            <p className="max-w-xs text-sm font-medium text-navy-900">
              Monitoring changes over time requires an account
            </p>
            <Button size="sm" asChild>
              <Link href="/signup">Start free trial</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Download a one-page PDF summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-slate-600">
            Enter your email to download this scan as a PDF you can keep on file.
          </p>
          <FreeScanEmailGate scanId={row.id} />
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  n,
  label,
  tone = 'default',
}: {
  n: number | string;
  label: string;
  tone?: 'default' | 'ok' | 'warn';
}) {
  const color =
    tone === 'warn' ? 'text-amber-600' : tone === 'ok' ? 'text-emerald-600' : 'text-navy-900';
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
      <div className={`text-2xl font-bold ${color}`}>{n}</div>
      <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}
