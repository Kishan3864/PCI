'use client';

import { useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * SpotlightCard — an emerald radial highlight that follows the cursor across
 * the card. Purely decorative; wrap any content.
 */
export function SpotlightCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        el.style.setProperty('--my', `${e.clientY - rect.top}px`);
      }}
      className={cn('spotlight', className)}
    >
      {children}
    </div>
  );
}
