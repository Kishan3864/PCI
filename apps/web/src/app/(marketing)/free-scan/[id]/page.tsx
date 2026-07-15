import type { FreeScanReport } from '@scriptproof/core';
import { schema } from '@scriptproof/db';
import { eq } from 'drizzle-orm';
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Globe,
  Lock,
  Radar,
  ScanLine,
  ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FreeScanEmailGate } from '@/components/free-scan-email-gate';
import { PollRefresh } from '@/components/poll-refresh';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Aurora, GradientText, GridGlow, Reveal, SpotlightCard } from '@/components/visual';
import { db } from '@/lib/db';

export const metadata: Metadata = { title: 'Scan results' };

export default async function FreeScanResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await db.query.freeScans.findFirst({ where: eq(schema.freeScans.id, id) });
  if (!row) notFound();

  if (row.status === 'queued' || row.status === 'running') {
    return (
      <section className="relative isolate overflow-hidden">
        <Aurora />
        <GridGlow />
        <div className="mx-auto max-w-xl px-6 py-28 text-center">
          <PollRefresh />
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-[2px] border border-blue-200 bg-blue-50/80 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
              <ScanLine className="h-3.5 w-3.5" /> Live scan in progress
            </span>
          </Reveal>
          <Reveal delay={80}>
            <div className="relative mx-auto mt-8 flex h-20 w-20 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-blue-600/20 animate-pulse-ring" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-[2px] bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-[0_16px_36px_-12px_rgba(37,99,235,0.6)]">
                <Radar className="h-7 w-7 animate-radar" />
              </div>
            </div>
          </Reveal>
          <Reveal delay={160}>
            <h1 className="mt-8 text-3xl font-bold tracking-tight text-navy-950">
              Scanning <GradientText animated>your page</GradientText>…
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="mt-3 break-all font-mono text-sm text-slate-500">{row.url}</p>
            <p className="mx-auto mt-5 max-w-sm text-sm leading-6 text-slate-600">
              This usually takes under a minute. The page will update automatically.
            </p>
          </Reveal>
        </div>
      </section>
    );
  }

  if (row.status === 'error') {
    const message =
      row.resultJson && typeof row.resultJson.error === 'string'
        ? row.resultJson.error
        : 'We could not scan that page.';
    return (
      <section className="relative isolate overflow-hidden">
        <Aurora muted />
        <div className="mx-auto max-w-xl px-6 py-28">
          <Reveal>
            <Card className="corner-frame overflow-hidden text-center">
              <CardContent className="p-10">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[2px] bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/25">
                  <XCircle className="h-7 w-7" />
                </div>
                <h1 className="mt-6 text-2xl font-bold text-navy-900">Scan failed</h1>
                <p className="mt-2 text-slate-600">{message}</p>
                <Button className="mt-8" asChild>
                  <Link href="/free-scan">
                    Try another URL <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </section>
    );
  }

  const report = row.resultJson as unknown as FreeScanReport;

  return (
    <>
      {/* ── Results hero ─────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden">
        <Aurora />
        <GridGlow />
        <div className="mx-auto max-w-3xl px-6 py-16">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-[2px] border border-blue-200 bg-blue-50/80 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
              <Sparkles className="h-3.5 w-3.5" /> Scan complete
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-navy-950">
              <GradientText>Scan results</GradientText>
            </h1>
            <p className="mt-3 break-all font-mono text-sm text-slate-500">{report.url}</p>
          </Reveal>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Reveal delay={120}>
              <Stat n={report.scriptCount} label="Scripts" />
            </Reveal>
            <Reveal delay={200}>
              <Stat n={report.externalDomains.length} label="External domains" />
            </Reveal>
            <Reveal delay={280}>
              <Stat
                n={report.scriptsWithoutSri}
                label="Without SRI"
                tone={report.scriptsWithoutSri > 0 ? 'warn' : 'ok'}
              />
            </Reveal>
            <Reveal delay={360}>
              <Stat
                n={`${report.headersPresent}/${report.headersTotal}`}
                label="Security headers"
                tone={report.headersPresent < report.headersTotal ? 'warn' : 'ok'}
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Result detail ────────────────────────────────────────────── */}
      <div className="mx-auto max-w-3xl px-6 pb-20">
        <Reveal>
          <SpotlightCard className="card-lift corner-frame rounded-[2px] border border-slate-200 bg-white shadow-sm">
            <Card className="border-transparent bg-transparent shadow-none backdrop-blur-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="flex h-8 w-8 items-center justify-center rounded-[2px] bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-600/20">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  Security headers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {report.securityHeaders.map((h) => (
                    <li
                      key={h.header}
                      className="flex items-center gap-2 rounded-[2px] border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      {h.present ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      ) : (
                        <XCircle className="h-4 w-4 shrink-0 text-rose-500" />
                      )}
                      <span className="font-mono text-xs text-slate-700">{h.header}</span>
                      {!h.present ? (
                        <Badge variant="warning" className="ml-auto">
                          missing
                        </Badge>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </SpotlightCard>
        </Reveal>

        <Reveal delay={80}>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="flex h-8 w-8 items-center justify-center rounded-[2px] bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-600/20">
                  <Globe className="h-4 w-4" />
                </span>
                External script domains
              </CardTitle>
            </CardHeader>
            <CardContent>
              {report.externalDomains.length === 0 ? (
                <p className="text-sm text-slate-500">No external script domains found.</p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {report.externalDomains.map((d) => (
                    <li
                      key={d}
                      className="inline-flex items-center gap-2 rounded-[2px] border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-600"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                      {d}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </Reveal>

        {/* Blurred "changes over time" teaser — the paid capability. */}
        <Reveal delay={80}>
          <Card className="relative mt-6 overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="flex h-8 w-8 items-center justify-center rounded-[2px] bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-600/20">
                  <Radar className="h-4 w-4" />
                </span>
                Changes over time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="pointer-events-none select-none space-y-2 blur-sm" aria-hidden>
                <div className="flex justify-between text-sm text-slate-700">
                  <span>New script on checkout — cdn.tracker.example/x.js</span>
                  <span className="text-rose-700">critical</span>
                </div>
                <div className="flex justify-between text-sm text-slate-700">
                  <span>checkout.js content changed</span>
                  <span className="text-rose-700">critical</span>
                </div>
                <div className="flex justify-between text-sm text-slate-700">
                  <span>Content-Security-Policy weakened</span>
                  <span className="text-amber-700">warning</span>
                </div>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/70 text-center backdrop-blur">
                <div className="flex h-11 w-11 items-center justify-center rounded-[2px] bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.6)]">
                  <Lock className="h-5 w-5" />
                </div>
                <p className="max-w-xs text-sm font-medium text-navy-900">
                  Monitoring changes over time requires an account
                </p>
                <Button size="sm" asChild>
                  <Link href="/signup">
                    Start free trial <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={80}>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="flex h-8 w-8 items-center justify-center rounded-[2px] bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-600/20">
                  <FileText className="h-4 w-4" />
                </span>
                Download a one-page PDF summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-slate-600">
                Enter your email to download this scan as a PDF you can keep on file.
              </p>
              <FreeScanEmailGate scanId={row.id} />
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </>
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
    tone === 'warn' ? 'text-amber-700' : tone === 'ok' ? 'text-emerald-700' : 'text-navy-900';
  return (
    <div className="card-lift h-full rounded-[2px] border border-slate-200 bg-white p-5 text-center shadow-sm">
      <div className={`font-display text-3xl font-bold ${color}`}>{n}</div>
      <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}
