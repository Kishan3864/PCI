import { txtRecordValue } from '@scriptproof/core';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { VerifySitePanel } from '@/components/verify-site-panel';
import { requireSite } from '@/lib/org';

export const metadata: Metadata = { title: 'Verify site' };

export default async function VerifyPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const { site } = await requireSite(siteId);
  if (site.verifiedAt) redirect(`/app/sites/${site.id}/settings`);

  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-sm leading-6 text-slate-600">
        ScriptProof only monitors domains whose ownership has been proven. Pick either method —
        verification usually completes in a couple of minutes. Monitoring and the first baseline
        scan start automatically once verified.
      </p>
      <VerifySitePanel
        siteId={site.id}
        domain={site.domain}
        txtRecord={txtRecordValue(site.verifyToken)}
        metaTag={`<meta name="scriptproof-verify" content="${site.verifyToken}">`}
      />
    </div>
  );
}
