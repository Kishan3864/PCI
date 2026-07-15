import { AlertTriangle, Bell, FileText, LayoutDashboard, Radar, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * DashboardMock — a stylized "product screenshot" of the ScriptProof
 * inventory screen, built in CSS (crisp at any size, no image asset).
 * Used as the hero/product visual, enterprise-security style.
 */

const rows = [
  { name: 'js.stripe.com/v3', hash: 'a41f…09be', status: 'authorized', tone: 'ok' },
  { name: 'checkout.js', hash: '77c2…d1a0', status: 'authorized', tone: 'ok' },
  { name: 'cdn.tagmanager.io/gtm.js', hash: '5e9b…44f7', status: 'authorized', tone: 'ok' },
  { name: 'static.unknown-cdn.ru/p.js', hash: '0d3c…e6a2', status: 'flagged', tone: 'alert' },
  { name: 'analytics.shopmetrics.js', hash: 'b8a1…7c33', status: 'review', tone: 'warn' },
];

export function DashboardMock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'corner-frame corner-frame-dark relative w-full max-w-2xl rounded-[2px] border border-cyan-400/20 bg-surface-900/95 shadow-[0_40px_120px_-40px_rgba(11,37,69,0.55)]',
        className,
      )}
    >
      {/* window bar */}
      <div className="flex items-center gap-2 border-b border-slate-400/10 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        <span className="ml-3 font-mono text-[11px] text-slate-500">
          app.scriptproof — script inventory
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-[2px] bg-cyan-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-300 ring-1 ring-inset ring-cyan-400/30">
          <span className="h-1.5 w-1.5 animate-blink rounded-full bg-cyan-400" />
          monitoring live
        </span>
      </div>

      <div className="flex">
        {/* sidebar */}
        <div className="hidden w-36 shrink-0 flex-col gap-1 border-r border-slate-400/10 p-3 sm:flex">
          {[
            { icon: LayoutDashboard, label: 'Dashboard', active: false },
            { icon: Radar, label: 'Inventory', active: true },
            { icon: Bell, label: 'Changes', active: false },
            { icon: FileText, label: 'Evidence', active: false },
            { icon: Settings, label: 'Settings', active: false },
          ].map((item) => (
            <span
              key={item.label}
              className={cn(
                'inline-flex items-center gap-2 rounded-[2px] px-2.5 py-1.5 text-[11px] font-medium',
                item.active
                  ? 'bg-cyan-400/10 text-cyan-300 ring-1 ring-inset ring-cyan-400/30'
                  : 'text-slate-500',
              )}
            >
              <item.icon className="h-3.5 w-3.5" /> {item.label}
            </span>
          ))}
        </div>

        {/* main */}
        <div className="min-w-0 flex-1 p-4">
          {/* alert banner */}
          <div className="mb-3 flex items-center gap-2.5 rounded-[2px] border border-rose-400/30 bg-rose-400/10 px-3 py-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <p className="truncate text-[11px] font-medium text-rose-200">
              New unauthorized script detected on <span className="font-mono">/checkout</span> — 2
              min ago
            </p>
            <span className="ml-auto hidden rounded-[2px] bg-rose-400/20 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-300 sm:inline">
              critical
            </span>
          </div>

          {/* stat tiles */}
          <div className="mb-3 grid grid-cols-3 gap-2">
            {[
              { label: 'Scripts tracked', value: '14' },
              { label: 'Authorized', value: '12' },
              { label: 'Open alerts', value: '1', alert: true },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-[2px] border border-slate-400/10 bg-surface-800 px-3 py-2"
              >
                <p
                  className={cn(
                    'font-display text-lg font-bold',
                    s.alert ? 'text-rose-400' : 'text-cyan-300',
                  )}
                >
                  {s.value}
                </p>
                <p className="text-[10px] uppercase tracking-wide text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* table */}
          <div className="overflow-hidden rounded-[2px] border border-slate-400/10">
            <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-slate-400/10 bg-surface-800 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              <span>Script</span>
              <span className="hidden sm:block">SHA-256</span>
              <span>Status</span>
            </div>
            {rows.map((row) => (
              <div
                key={row.name}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-slate-400/5 px-3 py-2 last:border-0"
              >
                <span className="truncate font-mono text-[11px] text-slate-300">{row.name}</span>
                <span className="hidden font-mono text-[10px] text-slate-600 sm:block">
                  {row.hash}
                </span>
                <span
                  className={cn(
                    'rounded-[2px] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ring-1 ring-inset',
                    row.tone === 'ok' && 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/30',
                    row.tone === 'alert' && 'bg-rose-400/10 text-rose-300 ring-rose-400/30',
                    row.tone === 'warn' && 'bg-amber-400/10 text-amber-300 ring-amber-400/30',
                  )}
                >
                  {row.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* scan sweep over the whole mock */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-20 animate-scan"
        style={{ background: 'linear-gradient(to bottom, rgba(34,211,238,0.08), transparent)' }}
      />
    </div>
  );
}
