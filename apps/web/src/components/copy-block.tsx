'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

export function CopyBlock({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div>
      {label ? (
        <p className="mb-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-blue-700">
          {label}
        </p>
      ) : null}
      <div className="group relative flex items-start gap-3 overflow-hidden rounded-[2px] border border-navy-800 bg-navy-950 p-3.5 shadow-sm">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"
        />
        <code className="relative flex-1 break-all font-mono text-xs leading-5 text-cyan-200">
          {value}
        </code>
        <button
          type="button"
          aria-label="Copy to clipboard"
          className="relative shrink-0 rounded-[2px] border border-cyan-400/40 bg-cyan-400/10 p-1.5 text-cyan-300 transition-colors hover:border-cyan-300/60 hover:bg-cyan-400/20 hover:text-cyan-200 active:bg-cyan-400/30"
          onClick={async () => {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
