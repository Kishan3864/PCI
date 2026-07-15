import { PLANS, txtRecordValue } from '@scriptproof/core';
import { schema } from '@scriptproof/db';
import { asc, eq } from 'drizzle-orm';
import { CheckCircle2, FileStack, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { AddPageForm } from '@/components/add-page-form';
import { PageRow } from '@/components/page-row';
import { CopyBlock } from '@/components/copy-block';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GradientText, Reveal } from '@/components/visual';
import { db } from '@/lib/db';
import { requireSite } from '@/lib/org';
import { formatDateTime } from '@/lib/utils';

export const metadata: Metadata = { title: 'Site settings' };

export default async function SettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ siteId: string }>;
  searchParams: Promise<{ verified?: string }>;
}) {
  const { siteId } = await params;
  const { verified: justVerified } = await searchParams;
  const { org, site } = await requireSite(siteId);

  const sitePages = await db.query.pages.findMany({
    where: eq(schema.pages.siteId, site.id),
    orderBy: asc(schema.pages.createdAt),
  });

  const limits = PLANS[org.plan];
  const allow6h = limits.frequencies.includes('6h');

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Reveal>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900">
            Site <GradientText>settings</GradientText>
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage the pages we monitor and confirm domain ownership for{' '}
            <span className="font-medium text-navy-900">{site.domain}</span>.
          </p>
        </div>
      </Reveal>

      {justVerified ? (
        <Reveal>
          <div className="flex items-start gap-3 rounded-[2px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span>
              Domain verified — monitoring is active. The baseline scan for existing pages has been
              queued.
            </span>
          </div>
        </Reveal>
      ) : null}

      <Reveal delay={80}>
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[2px] bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
                <FileStack className="h-5 w-5" />
              </div>
              <div className="space-y-1.5">
                <CardTitle className="text-base">Monitored pages</CardTitle>
                <CardDescription>
                  {sitePages.length} of {limits.maxPagesPerSite} pages ({org.plan} plan). Point
                  ScriptProof at your checkout and any page where payment data is entered.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              {sitePages.map((page) => (
                <PageRow
                  key={page.id}
                  page={{
                    id: page.id,
                    siteId: site.id,
                    url: page.url,
                    label: page.label,
                    scanFrequency: page.scanFrequency,
                    isActive: page.isActive,
                    lastScanAt: page.lastScanAt?.toISOString() ?? null,
                  }}
                  verified={Boolean(site.verifiedAt)}
                  allow6h={allow6h}
                />
              ))}
            </div>
            <div className="mt-6 border-t border-slate-200 pt-6">
              <AddPageForm siteId={site.id} domain={site.domain} allow6h={allow6h} />
            </div>
          </CardContent>
        </Card>
      </Reveal>

      <Reveal delay={160}>
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[2px] bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="space-y-1.5">
                <CardTitle className="text-base">Domain verification</CardTitle>
                <CardDescription>
                  Confirm you own this domain to keep monitoring and scanning enabled.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {site.verifiedAt ? (
              <>
                <p className="flex flex-wrap items-center gap-2 text-slate-600">
                  <Badge variant="success">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                  </Badge>
                  via {site.verifyMethod === 'dns' ? 'DNS TXT record' : 'meta tag'} on{' '}
                  {formatDateTime(site.verifiedAt)}
                </p>
                <p className="text-xs text-slate-500">
                  Keep the record or tag in place — periodic re-checks may be added in a future
                  version.
                </p>
                <CopyBlock label="Your TXT record" value={txtRecordValue(site.verifyToken)} />
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="warning">Not verified</Badge>
                  <span className="text-slate-500">Monitoring is paused until verified.</span>
                </div>
                <p className="text-slate-600">
                  This site is not verified yet. Monitoring and scanning are disabled until you
                  prove domain ownership.
                </p>
                <Button asChild>
                  <Link href={`/app/sites/${site.id}/verify`}>Verify domain</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
