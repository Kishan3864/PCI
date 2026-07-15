import { txtRecordValue } from '@scriptproof/core';
import { ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { VerifySitePanel } from '@/components/verify-site-panel';
import { GradientText, Reveal } from '@/components/visual';
import { requireSite } from '@/lib/org';

export const metadata: Metadata = { title: 'Verify site' };

export default async function VerifyPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const { site } = await requireSite(siteId);
  if (site.verifiedAt) redirect(`/app/sites/${site.id}/settings`);

  return (
    <div className="space-y-8">
      <Reveal>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[2px] bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-600/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
              Verify <GradientText>ownership</GradientText>
            </h1>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            ScriptProof only monitors domains whose ownership has been proven. Pick either method —
            verification usually completes in a couple of minutes. Monitoring and the first baseline
            scan start automatically once verified.
          </p>
        </div>
      </Reveal>
      <Reveal delay={80}>
        <VerifySitePanel
          siteId={site.id}
          domain={site.domain}
          txtRecord={txtRecordValue(site.verifyToken)}
          metaTag={`<meta name="scriptproof-verify" content="${site.verifyToken}">`}
        />
      </Reveal>
    </div>
  );
}
