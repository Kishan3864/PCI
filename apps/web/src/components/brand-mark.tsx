import { cn } from '@/lib/utils';

/**
 * BrandMark — the ScriptProof radar glyph on a sharp trust-blue tile.
 * `glow` adds the ambient shadow (use in headers/hero, skip in dense chrome).
 */
export function BrandMark({ className, glow = true }: { className?: string; glow?: boolean }) {
  return (
    <span
      className={cn(
        'relative flex h-8 w-8 items-center justify-center rounded-[2px] bg-gradient-to-br from-blue-600 to-cyan-600',
        glow && 'shadow-[0_6px_18px_-6px_rgba(37,99,235,0.75)]',
        className,
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white" aria-hidden>
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.4" opacity="0.45" />
        <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.4" opacity="0.8" />
        <path d="M12 12 L18.5 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      </svg>
    </span>
  );
}
