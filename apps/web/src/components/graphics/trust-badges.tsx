import { FileCheck2, Fingerprint, Lock, ShieldCheck, Server, EyeOff } from 'lucide-react';
import type { ComponentType } from 'react';
import { cn } from '@/lib/utils';

/**
 * ShieldBadge + TrustBar — honest, verifiable trust marks (what the product
 * actually does), styled like enterprise compliance badges. No fabricated
 * awards or certifications.
 */

export function ShieldBadge({
  icon: Icon,
  title,
  sub,
  className,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  sub: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-[2px] border border-slate-200 bg-white px-4 py-3 shadow-sm transition-colors hover:border-blue-400/60',
        className,
      )}
    >
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
        <svg viewBox="0 0 40 44" className="absolute inset-0 h-full w-full" aria-hidden>
          <path
            d="M20 1 37 8v13c0 10.5-7.2 18.6-17 22C10.2 39.6 3 31.5 3 21V8l17-7z"
            fill="rgba(37,99,235,0.06)"
            stroke="rgba(37,99,235,0.45)"
            strokeWidth="1.5"
          />
        </svg>
        <Icon className="relative h-[18px] w-[18px] text-blue-600" />
      </span>
      <div className="leading-tight">
        <p className="text-sm font-bold text-navy-900">{title}</p>
        <p className="mt-0.5 text-[11px] text-slate-500">{sub}</p>
      </div>
    </div>
  );
}

const marks = [
  { icon: ShieldCheck, title: 'PCI DSS v4.0.1', sub: 'Supports req. 6.4.3 controls' },
  { icon: FileCheck2, title: 'Req. 11.6.1', sub: 'Tamper & change detection' },
  { icon: Fingerprint, title: 'SHA-256', sub: 'Every script fingerprinted' },
  { icon: Lock, title: 'TLS encrypted', sub: 'All monitoring traffic' },
  { icon: EyeOff, title: 'Zero card data', sub: 'Never requested or stored' },
  { icon: Server, title: 'Server-side', sub: 'No load on your checkout' },
];

export function TrustBar({ className }: { className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6', className)}>
      {marks.map((m) => (
        <ShieldBadge key={m.title} icon={m.icon} title={m.title} sub={m.sub} />
      ))}
    </div>
  );
}
