import { cn } from '@/lib/utils';

/**
 * TerminalScan — a security-ops style scan log, built in CSS with a
 * blinking cursor. Static lines (SSR-safe), styled like a live terminal.
 */

const lines = [
  { text: '$ scriptproof scan https://yourstore.com/checkout', tone: 'cmd' },
  { text: '✓ domain ownership verified (DNS TXT)', tone: 'ok' },
  { text: '✓ 14 scripts discovered · fingerprinting SHA-256…', tone: 'ok' },
  { text: '✓ 12/14 match authorized inventory', tone: 'ok' },
  { text: '⚠ 1 script changed since last scan: analytics.shopmetrics.js', tone: 'warn' },
  { text: '✕ 1 unknown script: static.unknown-cdn.ru/p.js — flagged', tone: 'err' },
  { text: '→ critical alert sent · evidence log updated', tone: 'info' },
] as const;

export function TerminalScan({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'corner-frame corner-frame-dark w-full max-w-xl rounded-[2px] border border-cyan-400/20 bg-surface-950/95 font-mono text-[12px] leading-6 shadow-[0_30px_80px_-30px_rgba(11,37,69,0.5)]',
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-slate-400/10 px-4 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        <span className="ml-2 text-[11px] text-slate-600">scriptproof — scan</span>
      </div>
      <div className="p-4">
        {lines.map((line) => (
          <p
            key={line.text}
            className={cn(
              line.tone === 'cmd' && 'text-slate-300',
              line.tone === 'ok' && 'text-emerald-300/90',
              line.tone === 'warn' && 'text-amber-300/90',
              line.tone === 'err' && 'text-rose-300',
              line.tone === 'info' && 'text-cyan-300',
            )}
          >
            {line.text}
          </p>
        ))}
        <p className="text-slate-500">
          <span className="animate-blink inline-block h-3.5 w-2 translate-y-0.5 bg-cyan-400" />
        </p>
      </div>
    </div>
  );
}
