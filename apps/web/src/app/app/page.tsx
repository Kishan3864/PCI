import { schema } from '@scriptproof/db';
import { and, count, desc, eq, inArray, isNull } from 'drizzle-orm';
import { AlertTriangle, ArrowRight, FileText, Globe, Plus } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GradientText, Reveal } from '@/components/visual';
import { db } from '@/lib/db';
import { requireOrg } from '@/lib/org';
import { formatDateTime } from '@/lib/utils';

export default async function DashboardPage() {
  const { org } = await requireOrg();

  const sites = await db.query.sites.findMany({
    where: eq(schema.sites.orgId, org.id),
    with: { pages: true },
    orderBy: desc(schema.sites.createdAt),
  });

  const pageIds = sites.flatMap((s) => s.pages.map((p) => p.id));
  const openCriticals = pageIds.length
    ? await db
        .select({ pageId: schema.changes.pageId, value: count() })
        .from(schema.changes)
        .where(
          and(
            inArray(schema.changes.pageId, pageIds),
            eq(schema.changes.severity, 'critical'),
            isNull(schema.changes.acknowledgedAt),
          ),
        )
        .groupBy(schema.changes.pageId)
    : [];
  const criticalsByPage = new Map(openCriticals.map((r) => [r.pageId, r.value]));

  return (
    <div className="space-y-8">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
              Your <GradientText>Sites</GradientText>
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600">
              Every domain ScriptProof watches for you — script inventory, tamper detection, and the
              evidence trail behind each one.
            </p>
          </div>
          <Button asChild>
            <Link href="/app/sites/new">
              <Plus className="h-4 w-4" /> Add site
            </Link>
          </Button>
        </div>
      </Reveal>

      {sites.length === 0 ? (
        <Reveal delay={80}>
          <Card className="overflow-hidden">
            <CardContent className="relative flex flex-col items-center gap-4 px-6 py-20 text-center">
              <div
                aria-hidden
                className="absolute -top-16 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-emerald-400/15 blur-3xl"
              />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_16px_36px_-12px_rgba(16,185,129,0.8)]">
                <Globe className="h-8 w-8" />
              </div>
              <p className="relative font-display text-lg font-semibold text-navy-900">
                No sites yet
              </p>
              <p className="relative max-w-sm text-sm leading-6 text-slate-600">
                Add your store's domain, verify you own it, and ScriptProof starts building your
                script inventory on the first scan.
              </p>
              <Button className="relative mt-2" asChild>
                <Link href="/app/sites/new">
                  Add your first site <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </Reveal>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {sites.map((site, i) => {
            const criticals = site.pages.reduce(
              (sum, p) => sum + (criticalsByPage.get(p.id) ?? 0),
              0,
            );
            const lastScan = site.pages
              .map((p) => p.lastScanAt)
              .filter((d): d is Date => d !== null)
              .sort((a, b) => b.getTime() - a.getTime())[0];
            return (
              <Reveal key={site.id} delay={i * 80}>
                <Link href={`/app/sites/${site.id}`} className="group block h-full">
                  <Card className="card-lift h-full">
                    <CardHeader className="flex-row items-center justify-between space-y-0">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-600/15">
                          <Globe className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-base">{site.domain}</CardTitle>
                      </div>
                      {site.verifiedAt ? (
                        <Badge variant="success">Verified</Badge>
                      ) : (
                        <Badge variant="warning">Unverified</Badge>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-slate-600">
                      <p className="flex items-center gap-1.5 text-slate-500">
                        <FileText className="h-4 w-4 text-slate-400" />
                        {site.pages.length} monitored page{site.pages.length === 1 ? '' : 's'} ·
                        last scan {formatDateTime(lastScan ?? null)}
                      </p>
                      {criticals > 0 ? (
                        <p className="flex items-center gap-1.5 font-medium text-red-700">
                          <AlertTriangle className="h-4 w-4" />
                          {criticals} unacknowledged critical change{criticals === 1 ? '' : 's'}
                        </p>
                      ) : (
                        <p className="flex items-center gap-1.5 text-emerald-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          No open critical changes
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
