import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-[2px] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ring-1 ring-inset transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-navy-50 text-navy-700 ring-navy-600/15',
        brand: 'bg-blue-50 text-blue-700 ring-blue-600/25',
        secondary: 'bg-slate-100 text-slate-700 ring-slate-500/15',
        success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/25',
        critical: 'bg-rose-50 text-rose-700 ring-rose-600/25',
        warning: 'bg-amber-50 text-amber-700 ring-amber-600/25',
        info: 'bg-sky-50 text-sky-700 ring-sky-600/25',
        outline: 'text-slate-700 ring-slate-300',
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
