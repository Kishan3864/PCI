import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[2px] text-sm font-semibold uppercase tracking-wide transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-900 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'shimmer bg-gradient-to-b from-cyan-400 to-cyan-500 text-surface-900 shadow-[0_10px_30px_-10px_rgba(34,211,238,0.6)] hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-12px_rgba(34,211,238,0.8)]',
        destructive:
          'shimmer bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-[0_10px_30px_-10px_rgba(244,63,94,0.5)] hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-12px_rgba(244,63,94,0.7)]',
        outline:
          'border border-cyan-400/40 bg-transparent text-cyan-300 hover:-translate-y-0.5 hover:border-cyan-400/80 hover:bg-cyan-400/10 hover:text-cyan-200',
        secondary:
          'border border-surface-600 bg-surface-700 text-slate-200 hover:border-cyan-400/40 hover:bg-surface-600',
        ghost: 'normal-case tracking-normal text-slate-300 hover:bg-cyan-400/10 hover:text-cyan-300',
        link: 'normal-case tracking-normal text-cyan-400 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-7 text-[0.9rem]',
        xl: 'h-12 px-8 text-[0.95rem]',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
