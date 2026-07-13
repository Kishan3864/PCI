import { schema } from '@scriptproof/db';
import { and, count, desc, eq, inArray, isNull } from 'drizzle-orm';
import { AlertTriangle, Globe, Plus } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900">Sites</h1>
        <Button asChild>
          <Link href="/app/sites/new">
            <Plus className="h-4 w-4" /> Add site
          </Link>
        </Button>
      </div>

      {sites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Globe className="h-10 w-10 text-slate-300" />
            <p className="font-medium text-slate-700">No sites yet</p>
            <p className="max-w-sm text-sm text-slate-500">
              Add your store's domain, verify you own it, and ScriptProof starts building your
              script inventory on the first scan.
            </p>
            <Button className="mt-2" asChild>
              <Link href="/app/sites/new">Add your first site</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sites.map((site) => {
            const criticals = site.pages.reduce(
              (sum, p) => sum + (criticalsByPage.get(p.id) ?? 0),
              0,
            );
            const lastScan = site.pages
              .map((p) => p.lastScanAt)
              .filter((d): d is Date => d !== null)
              .sort((a, b) => b.getTime() - a.getTime())[0];
            return (
              <Link key={site.id} href={`/app/sites/${site.id}`} className="group">
                <Card className="transition-shadow group-hover:shadow-md">
                  <CardHeader className="flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-base">{site.domain}</CardTitle>
                    {site.verifiedAt ? (
                      <Badge variant="success">Verified</Badge>
                    ) : (
                      <Badge variant="warning">Unverified</Badge>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-slate-600">
                    <p>
                      {site.pages.length} monitored page{site.pages.length === 1 ? '' : 's'} · last
                      scan {formatDateTime(lastScan ?? null)}
                    </p>
                    {criticals > 0 ? (
                      <p className="flex items-center gap-1.5 font-medium text-red-700">
                        <AlertTriangle className="h-4 w-4" />
                        {criticals} unacknowledged critical change{criticals === 1 ? '' : 's'}
                      </p>
                    ) : (
                      <p className="text-slate-400">No open critical changes</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
