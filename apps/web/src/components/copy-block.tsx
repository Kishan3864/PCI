'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

export function CopyBlock({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div>
      {label ? (
        <p className="mb-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
          {label}
        </p>
      ) : null}
      <div className="group relative flex items-start gap-2 overflow-hidden rounded-xl border border-emerald-200/60 bg-emerald-50/40 p-3.5 shadow-sm backdrop-blur-sm">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-emerald-400/10 blur-2xl"
        />
        <code className="relative flex-1 break-all font-mono text-xs leading-5 text-navy-800">
          {value}
        </code>
        <button
          type="button"
          aria-label="Copy to clipboard"
          className="relative shrink-0 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 p-1.5 text-white shadow-[0_6px_16px_-8px_rgba(16,185,129,0.9)] ring-1 ring-inset ring-white/20 transition-transform hover:scale-105 active:scale-95"
          onClick={async () => {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
