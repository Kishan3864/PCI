import { planAllows } from '@scriptproof/core';
import { schema } from '@scriptproof/db';
import { desc, eq } from 'drizzle-orm';
import { Download, FileText } from 'lucide-react';
import type { Metadata } from 'next';
import { generateEvidence } from '@/actions/evidence';
import { ActionButton } from '@/components/action-button';
import { UpgradePrompt } from '@/components/upgrade-prompt';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-slate-600">
          A monthly PDF documenting your script inventory, change log, header monitoring and scan
          cadence — evidence you can attach to your SAQ. Generated automatically each month, or on
          demand.
        </p>
        <ActionButton
          action={generateEvidence}
          fields={{ siteId: site.id }}
          showResult
          variant="outline"
        >
          Generate now
        </ActionButton>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <FileText className="h-10 w-10 text-slate-300" />
            <p className="font-medium text-slate-700">No Evidence Packs yet</p>
            <p className="max-w-md text-sm text-slate-500">
              Press “Generate now” to build one for the current month, or wait for the automatic
              monthly run.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <ul className="divide-y divide-slate-100">
            {reports.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="flex items-center gap-2 font-medium text-navy-900">
                    <FileText className="h-4 w-4 text-navy-600" />
                    {formatDateTime(r.periodStart)} – {formatDateTime(r.periodEnd)}
                  </p>
                  <p className="text-xs text-slate-500">
                    Generated {formatDateTime(r.generatedAt)}
                  </p>
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
      )}
    </div>
  );
}
