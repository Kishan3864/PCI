import { Globe } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { SiteTabs } from '@/components/site-tabs';
import { Reveal } from '@/components/visual';
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
      <Reveal>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-600/15">
            <Globe className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">{site.domain}</h1>
          {site.verifiedAt ? (
            <Badge variant="success">Verified</Badge>
          ) : (
            <Badge variant="warning">Unverified</Badge>
          )}
        </div>
      </Reveal>
      <SiteTabs siteId={site.id} verified={Boolean(site.verifiedAt)} />
      {children}
    </div>
  );
}
