import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-[2px] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ring-1 ring-inset transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-surface-700 text-slate-200 ring-slate-400/25',
        brand: 'bg-cyan-400/10 text-cyan-300 ring-cyan-400/40',
        secondary: 'bg-surface-700 text-slate-300 ring-slate-500/25',
        success: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/40',
        critical: 'bg-rose-400/10 text-rose-300 ring-rose-400/40',
        warning: 'bg-amber-400/10 text-amber-300 ring-amber-400/40',
        info: 'bg-sky-400/10 text-sky-300 ring-sky-400/40',
        outline: 'text-slate-300 ring-slate-500/40',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
