import * as React from 'react';
import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-[2px] border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-navy-900 shadow-sm transition-all placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
