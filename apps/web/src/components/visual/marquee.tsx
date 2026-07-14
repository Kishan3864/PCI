import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Marquee — seamless, infinitely scrolling row. Renders its children twice so
 * the -50% translate loops without a seam. Edges fade via a mask. Pure CSS.
 */
export function Marquee({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn('group relative overflow-hidden', className)}
      style={{
        WebkitMaskImage: 'linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)',
        maskImage: 'linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)',
      }}
    >
      <div className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused]">
        <div className="flex shrink-0 gap-4">{children}</div>
        <div className="flex shrink-0 gap-4" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
