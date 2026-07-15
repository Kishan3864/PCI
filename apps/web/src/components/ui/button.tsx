import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[2px] text-sm font-semibold uppercase tracking-wide transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'shimmer bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-[0_10px_28px_-10px_rgba(37,99,235,0.55)] hover:-translate-y-0.5 hover:shadow-[0_16px_38px_-12px_rgba(37,99,235,0.7)]',
        destructive:
          'shimmer bg-gradient-to-b from-rose-600 to-rose-700 text-white shadow-[0_10px_28px_-10px_rgba(225,29,72,0.45)] hover:-translate-y-0.5 hover:shadow-[0_16px_38px_-12px_rgba(225,29,72,0.6)]',
        outline:
          'border border-navy-200 bg-white text-navy-800 shadow-sm hover:-translate-y-0.5 hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-800 hover:shadow-md',
        secondary:
          'border border-blue-100 bg-blue-50 text-blue-800 hover:border-blue-200 hover:bg-blue-100',
        ghost: 'normal-case tracking-normal text-slate-600 hover:bg-blue-50 hover:text-blue-800',
        link: 'normal-case tracking-normal text-blue-700 underline-offset-4 hover:underline',
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
