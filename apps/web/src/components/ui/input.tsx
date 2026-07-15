import * as React from 'react';
import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-[2px] border border-slate-300 bg-white px-3.5 py-1 text-sm text-navy-900 shadow-sm transition-all placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
