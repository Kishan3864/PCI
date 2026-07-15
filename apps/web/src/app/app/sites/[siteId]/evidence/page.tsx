import { planAllows } from '@scriptproof/core';
import { schema } from '@scriptproof/db';
import { desc, eq } from 'drizzle-orm';
import { Download, FileText } from 'lucide-react';
import type { Metadata } from 'next';
import { generateEvidence } from '@/actions/evidence';
import { ActionButton } from '@/components/action-button';
import { UpgradePrompt } from '@/components/upgrade-prompt';
import { EvidenceMock } from '@/components/graphics';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GradientText, Reveal } from '@/components/visual';
import { db } from '@/lib/db';
import { requireSite } from '@/lib/org';
import { formatDateTime } from '@/lib/utils';

export const metadata: Metadata = { title: 'Evidence Packs' };

export default async function EvidencePage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const { org, site } = await requireSite(siteId);

  if (!planAllows(org.plan, 'evidencePacks')) {
    return <UpgradePrompt feature="Evidence Packs" requiredPlan="Pro" />;
  }

  const reports = await db.query.evidenceReports.findMany({
    where: eq(schema.evidenceReports.siteId, site.id),
    orderBy: desc(schema.evidenceReports.generatedAt),
  });

  return (
    <div className="space-y-8">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
                Evidence <GradientText>Packs</GradientText>
              </h1>
              {reports.length > 0 ? (
                <Badge variant="brand">
                  {reports.length} {reports.length === 1 ? 'pack' : 'packs'}
                </Badge>
              ) : null}
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-600">
              A monthly PDF documenting your script inventory, change log, header monitoring and
              scan cadence — evidence you can attach to your SAQ. Generated automatically each
              month, or on demand.
            </p>
          </div>
          <ActionButton
            action={generateEvidence}
            fields={{ siteId: site.id }}
            showResult
            variant="outline"
          >
            Generate now
          </ActionButton>
        </div>
      </Reveal>

      {reports.length === 0 ? (
        <Reveal delay={80}>
          <div className="corner-frame relative isolate overflow-hidden rounded-[2px] border border-slate-200 bg-white shadow-sm">
            <div aria-hidden className="sp-dots absolute inset-0 -z-10" />
            <div className="grid items-center gap-10 px-8 py-14 lg:grid-cols-[1fr_auto] lg:px-14">
              <div className="max-w-lg">
                <div className="flex h-11 w-11 items-center justify-center rounded-[2px] bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-600/20">
                  <FileText className="h-5 w-5" />
                </div>
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                  No Evidence Packs yet
                </p>
                <h2 className="mt-2 font-display text-xl font-bold tracking-tight text-navy-900">
                  Your paper trail starts with the first pack
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Press “Generate now” to build one for the current month, or wait for the automatic
                  monthly run. Each pack bundles your script inventory, authorizations, change log
                  and scan cadence into a signed PDF.
                </p>
              </div>
              <div className="hidden justify-self-center lg:block">
                <EvidenceMock className="max-w-xs" />
              </div>
            </div>
          </div>
        </Reveal>
      ) : (
        <Reveal delay={80}>
          <Card>
            <ul className="divide-y divide-slate-100">
              {reports.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-4 p-4 transition-colors hover:bg-blue-50/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[2px] bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-600/20">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-navy-900">
                        {formatDateTime(r.periodStart)} – {formatDateTime(r.periodEnd)}
                      </p>
                      <p className="text-xs text-slate-500">
                        Generated {formatDateTime(r.generatedAt)}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/app/sites/${site.id}/evidence/${r.id}/download`} download>
                      <Download className="h-4 w-4" /> Download PDF
                    </a>
                  </Button>
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>
      )}
    </div>
  );
}
