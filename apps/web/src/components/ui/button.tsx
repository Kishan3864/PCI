import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'shimmer bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-[0_10px_30px_-10px_rgba(16,185,129,0.7)] hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-12px_rgba(16,185,129,0.9)]',
        destructive:
          'shimmer bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-[0_10px_30px_-10px_rgba(244,63,94,0.6)] hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-12px_rgba(244,63,94,0.8)]',
        outline:
          'border border-emerald-200/80 bg-white/70 text-navy-800 shadow-sm backdrop-blur hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-white hover:shadow-md',
        secondary:
          'border border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800',
        ghost: 'text-navy-700 hover:bg-emerald-50 hover:text-emerald-700',
        link: 'text-emerald-700 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-11 rounded-xl px-7 text-[0.95rem]',
        xl: 'h-12 rounded-xl px-8 text-base',
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
