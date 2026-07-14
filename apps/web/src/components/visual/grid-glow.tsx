import { cn } from '@/lib/utils';

/**
 * GridGlow — faint technical grid, radially masked to fade at the edges.
 * Adds "engineered" structure behind hero / feature sections. Pure CSS.
 */
export function GridGlow({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('sp-grid pointer-events-none absolute inset-0 -z-10', className)}
    />
  );
}
