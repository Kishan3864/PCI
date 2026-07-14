import { planAllows } from '@scriptproof/core';
import { schema } from '@scriptproof/db';
import { desc, eq } from 'drizzle-orm';
import { Download, FileText } from 'lucide-react';
import type { Metadata } from 'next';
import { generateEvidence } from '@/actions/evidence';
import { ActionButton } from '@/components/action-button';
import { UpgradePrompt } from '@/components/upgrade-prompt';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_8px_20px_-8px_rgba(16,185,129,0.8)]">
                <FileText className="h-6 w-6" />
              </div>
              <p className="font-semibold text-navy-900">No Evidence Packs yet</p>
              <p className="max-w-md text-sm leading-6 text-slate-500">
                Press “Generate now” to build one for the current month, or wait for the automatic
                monthly run.
              </p>
            </CardContent>
          </Card>
        </Reveal>
      ) : (
        <Reveal delay={80}>
          <Card>
            <ul className="divide-y divide-slate-100">
              {reports.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-4 p-4 transition-colors hover:bg-emerald-50/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-600/15">
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
