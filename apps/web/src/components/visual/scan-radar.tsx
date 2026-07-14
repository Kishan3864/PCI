import { AlertTriangle, ScanLine, ShieldCheck } from 'lucide-react';
import type { ComponentType } from 'react';
import { cn } from '@/lib/utils';

/**
 * ScanRadar — the hero product visual. A glassy radar disc with a rotating
 * sweep, a horizontal scan line, "script" nodes (one flagged), a pulsing core,
 * and floating glass chips that narrate the monitoring story. Pure CSS motion.
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
        'glass-strong flex items-center gap-2 rounded-xl px-3 py-2 shadow-lg',
        className,
      )}
      style={style}
    >
      <span
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-lg',
          tone === 'ok' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600',
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="leading-tight">
        <p className="font-mono text-xs font-semibold text-navy-900">{label}</p>
        <p
          className={cn(
            'text-[10px] font-medium',
            tone === 'ok' ? 'text-emerald-600' : 'text-rose-600',
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
        className="absolute inset-8 animate-glow rounded-full bg-emerald-400/25 blur-3xl"
      />

      {/* radar disc */}
      <div className="absolute inset-0 overflow-hidden rounded-full glass">
        {/* concentric rings */}
        {[18, 34, 50].map((inset) => (
          <div
            key={inset}
            aria-hidden
            className="absolute rounded-full border border-emerald-500/15"
            style={{ inset: `${inset}%` }}
          />
        ))}

        {/* crosshair */}
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-emerald-500/10" />
        <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-emerald-500/10" />
        <div aria-hidden className="sp-grid absolute inset-0 opacity-50" />

        {/* rotating sweep */}
        <div
          aria-hidden
          className="absolute inset-0 animate-radar"
          style={{
            background:
              'conic-gradient(from 0deg, rgba(16,185,129,0) 0deg, rgba(16,185,129,0) 296deg, rgba(16,185,129,0.14) 330deg, rgba(16,185,129,0.55) 358deg, rgba(16,185,129,0) 360deg)',
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
                n.detect ? 'bg-rose-500 ring-rose-200' : 'bg-emerald-500 ring-emerald-200',
              )}
            />
          </div>
        ))}

        {/* center core */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="absolute -inset-3 animate-pulse-ring rounded-full bg-emerald-400/40" />
          <span className="relative block h-4 w-4 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-[0_0_22px_rgba(16,185,129,0.85)]" />
        </div>

        {/* horizontal scan line */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-16 animate-scan"
          style={{ background: 'linear-gradient(to bottom, rgba(16,185,129,0.35), transparent)' }}
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
