import * as React from 'react';
import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-[2px] border border-slate-400/20 bg-surface-900/80 px-3.5 py-2.5 text-sm text-slate-100 shadow-sm transition-all placeholder:text-slate-500 focus-visible:border-cyan-400/70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
