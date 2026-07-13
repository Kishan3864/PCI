import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { SiteTabs } from '@/components/site-tabs';
import { requireSite } from '@/lib/org';

export default async function SiteLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;
  const { site } = await requireSite(siteId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-navy-900">{site.domain}</h1>
        {site.verifiedAt ? (
          <Badge variant="success">Verified</Badge>
        ) : (
          <Badge variant="warning">Unverified</Badge>
        )}
      </div>
      <SiteTabs siteId={site.id} verified={Boolean(site.verifiedAt)} />
      {children}
    </div>
  );
}
