import { AlertTriangle, ScanLine, ShieldCheck } from 'lucide-react';
import type { ComponentType } from 'react';
import { cn } from '@/lib/utils';

/**
 * ScanRadar — radar disc with a rotating blue sweep, "script" nodes (one
 * flagged), a pulsing core, and floating chips narrating the monitoring
 * story. Pure CSS motion. (Radar disc is intentionally circular — it's a
 * radar — while chips/panels stay sharp per the 2px-radius system.)
 */

const nodes = [
  { top: '24%', left: '32%', detect: false },
  { top: '39%', left: '66%', detect: true },
  { top: '63%', left: '41%', detect: false },
  { top: '69%', left: '60%', detect: false },
  { top: '33%', left: '50%', detect: false },
];

function Chip({
  icon: Icon,
  label,
  sub,
  tone,
  className,
  style,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  sub: string;
  tone: 'ok' | 'alert';
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn(
        'glass-strong flex items-center gap-2 rounded-[2px] px-3 py-2 shadow-lg',
        className,
      )}
      style={style}
    >
      <span
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-[2px]',
          tone === 'ok' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600',
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="leading-tight">
        <p className="font-mono text-xs font-semibold text-navy-900">{label}</p>
        <p
          className={cn(
            'text-[10px] font-medium uppercase tracking-wide',
            tone === 'ok' ? 'text-blue-600' : 'text-rose-600',
          )}
        >
          {sub}
        </p>
      </div>
    </div>
  );
}

export function ScanRadar({ className }: { className?: string }) {
  return (
    <div className={cn('relative mx-auto aspect-square w-full max-w-md', className)}>
      {/* ambient glow */}
      <div
        aria-hidden
        className="absolute inset-8 animate-glow rounded-full bg-blue-400/20 blur-3xl"
      />

      {/* radar disc */}
      <div className="glass absolute inset-0 overflow-hidden rounded-full">
        {/* concentric rings */}
        {[18, 34, 50].map((inset) => (
          <div
            key={inset}
            aria-hidden
            className="absolute rounded-full border border-blue-500/15"
            style={{ inset: `${inset}%` }}
          />
        ))}

        {/* crosshair */}
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-blue-500/10" />
        <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-blue-500/10" />
        <div aria-hidden className="sp-grid absolute inset-0 opacity-60" />

        {/* rotating sweep */}
        <div
          aria-hidden
          className="absolute inset-0 animate-radar"
          style={{
            background:
              'conic-gradient(from 0deg, rgba(37,99,235,0) 0deg, rgba(37,99,235,0) 296deg, rgba(37,99,235,0.1) 330deg, rgba(37,99,235,0.4) 358deg, rgba(37,99,235,0) 360deg)',
          }}
        />

        {/* script nodes */}
        {nodes.map((n, i) => (
          <div key={i} className="absolute" style={{ top: n.top, left: n.left }}>
            {n.detect && (
              <span className="absolute -inset-2 animate-pulse-ring rounded-full bg-rose-400/40" />
            )}
            <span
              className={cn(
                'block h-2.5 w-2.5 rounded-full ring-2',
                n.detect ? 'bg-rose-500 ring-rose-200' : 'bg-blue-600 ring-blue-200',
              )}
            />
          </div>
        ))}

        {/* center core */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="absolute -inset-3 animate-pulse-ring rounded-full bg-blue-400/40" />
          <span className="relative block h-4 w-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 shadow-[0_0_22px_rgba(37,99,235,0.75)]" />
        </div>

        {/* horizontal scan line */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-16 animate-scan"
          style={{ background: 'linear-gradient(to bottom, rgba(37,99,235,0.18), transparent)' }}
        />
      </div>

      {/* floating narrative chips */}
      <div className="absolute left-0 top-8 animate-float">
        <Chip icon={ShieldCheck} tone="ok" label="stripe.js" sub="authorized" />
      </div>
      <div className="absolute -right-2 top-1/3 animate-float-slow">
        <Chip icon={AlertTriangle} tone="alert" label="unknown.js" sub="new · flagged" />
      </div>
      <div className="absolute bottom-6 right-2 animate-float" style={{ animationDelay: '1.2s' }}>
        <Chip icon={ScanLine} tone="ok" label="checkout.js" sub="unchanged" />
      </div>
    </div>
  );
}
