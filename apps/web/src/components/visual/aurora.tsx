import { cn } from '@/lib/utils';

/**
 * Aurora — soft blue/cyan/sky glows drifting over the light canvas.
 * Pure CSS (no client JS). Drop into any `relative` container; it sits behind
 * content at -z-10 and is aria-hidden.
 */
export function Aurora({ className, muted = false }: { className?: string; muted?: boolean }) {
  const o = muted ? 0.25 : 0.45;
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)}
    >
      <div
        className="sp-aurora-blob animate-aurora"
        style={{
          top: '-12%',
          left: '-6%',
          width: '44rem',
          height: '44rem',
          opacity: o,
          background: 'radial-gradient(circle, #93c5fd, transparent 62%)',
        }}
      />
      <div
        className="sp-aurora-blob animate-aurora-slow"
        style={{
          top: '8%',
          right: '-12%',
          width: '40rem',
          height: '40rem',
          opacity: o,
          background: 'radial-gradient(circle, #a5f3fc, transparent 62%)',
        }}
      />
      <div
        className="sp-aurora-blob animate-float-slow"
        style={{
          bottom: '-18%',
          left: '22%',
          width: '36rem',
          height: '36rem',
          opacity: o * 0.7,
          background: 'radial-gradient(circle, #bae6fd, transparent 62%)',
        }}
      />
    </div>
  );
}
