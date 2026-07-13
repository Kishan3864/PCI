import { PLANS, txtRecordValue } from '@scriptproof/core';
import { schema } from '@scriptproof/db';
import { asc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { AddPageForm } from '@/components/add-page-form';
import { PageRow } from '@/components/page-row';
import { CopyBlock } from '@/components/copy-block';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="space-y-6">
      {justVerified ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Domain verified — monitoring is active. The baseline scan for existing pages has been
          queued.
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monitored pages</CardTitle>
          <CardDescription>
            {sitePages.length} of {limits.maxPagesPerSite} pages ({org.plan} plan). Point
            ScriptProof at your checkout and any page where payment data is entered.
          </CardDescription>
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
          <div className="mt-6 border-t border-slate-100 pt-6">
            <AddPageForm siteId={site.id} domain={site.domain} allow6h={allow6h} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Domain verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {site.verifiedAt ? (
            <>
              <p className="flex items-center gap-2 text-slate-600">
                <Badge variant="success">Verified</Badge>
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
              <p className="text-slate-600">
                This site is not verified yet. Monitoring and scanning are disabled until you prove
                domain ownership.
              </p>
              <Button asChild>
                <Link href={`/app/sites/${site.id}/verify`}>Verify domain</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
