import { AlertTriangle, ArrowRight, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * AlertMock — a stylized critical-alert email, built in CSS.
 * Shows the before/after hash diff that lands in the merchant's inbox.
 */
export function AlertMock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'corner-frame corner-frame-dark relative w-full max-w-sm rounded-[2px] border border-rose-400/25 bg-surface-900/95 shadow-[0_30px_80px_-30px_rgba(11,37,69,0.5)]',
        className,
      )}
    >
      <div className="flex items-center gap-2.5 border-b border-slate-400/10 px-4 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-[2px] bg-rose-400/15 text-rose-400">
          <Mail className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-white">
            🚨 Critical: new script on /checkout
          </p>
          <p className="text-[10px] text-slate-500">alerts@scriptproof → you · just now</p>
        </div>
        <span className="ml-auto shrink-0 rounded-[2px] bg-rose-400/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-rose-300 ring-1 ring-inset ring-rose-400/30">
          critical
        </span>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start gap-2 rounded-[2px] border border-rose-400/25 bg-rose-400/5 px-3 py-2.5">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
          <p className="font-mono text-[11px] leading-5 text-rose-200">
            static.unknown-cdn.ru/p.js
            <span className="block text-[10px] text-slate-500">
              first seen 14:02 UTC · not in your authorized inventory
            </span>
          </p>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
          <div className="rounded-[2px] border border-slate-400/15 bg-surface-800 px-2 py-2">
            <p className="text-[9px] uppercase tracking-wider text-slate-500">Before</p>
            <p className="mt-0.5 font-mono text-[10px] text-emerald-300">13 scripts</p>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
          <div className="rounded-[2px] border border-rose-400/30 bg-rose-400/5 px-2 py-2">
            <p className="text-[9px] uppercase tracking-wider text-slate-500">After</p>
            <p className="mt-0.5 font-mono text-[10px] text-rose-300">14 scripts (+1)</p>
          </div>
        </div>

        <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-[2px] bg-gradient-to-b from-cyan-400 to-cyan-500 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-surface-900">
          Review &amp; authorize <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </div>
  );
}
