import { FileText, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * EvidenceMock — a stylized Evidence Pack PDF document, built in CSS.
 * Communicates "paper trail your bank will accept" at a glance.
 */
export function EvidenceMock({ className }: { className?: string }) {
  return (
    <div className={cn('relative w-full max-w-sm', className)}>
      {/* back page */}
      <div
        aria-hidden
        className="absolute -right-3 top-3 h-full w-full rounded-[2px] border border-slate-400/10 bg-surface-800/60"
      />
      {/* front page */}
      <div className="corner-frame relative rounded-[2px] border border-cyan-400/20 bg-surface-900/95 p-6 shadow-[0_30px_80px_-30px_rgba(34,211,238,0.3)]">
        <div className="flex items-center justify-between border-b border-slate-400/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-[2px] bg-gradient-to-br from-cyan-400 to-blue-600 text-surface-900">
              <FileText className="h-[18px] w-[18px]" />
            </span>
            <div>
              <p className="text-sm font-bold text-white">Evidence Pack</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Monthly · PDF · PCI DSS 6.4.3 / 11.6.1
              </p>
            </div>
          </div>
          <span className="rounded-[2px] bg-emerald-400/10 px-2 py-1 text-[10px] font-bold uppercase text-emerald-300 ring-1 ring-inset ring-emerald-400/30">
            Generated
          </span>
        </div>

        {[
          { label: 'A. Script inventory & authorizations', width: 'w-full' },
          { label: 'B. Change log with hashes', width: 'w-11/12' },
          { label: 'C. Security header history', width: 'w-4/5' },
          { label: 'D. Scan cadence & coverage', width: 'w-3/4' },
        ].map((s) => (
          <div key={s.label} className="mt-4">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
              <ShieldCheck className="h-3 w-3 text-cyan-400" /> {s.label}
            </p>
            <div className={cn('mt-1.5 h-1.5 rounded-[1px] bg-slate-400/15', s.width)} />
            <div className="mt-1 h-1.5 w-2/3 rounded-[1px] bg-slate-400/10" />
          </div>
        ))}

        <div className="mt-5 flex items-center justify-between border-t border-slate-400/10 pt-3">
          <p className="font-mono text-[10px] text-slate-600">sha256: 8c1f…a2e9 · signed</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400">
            Ready for your SAQ
          </p>
        </div>
      </div>
    </div>
  );
}
