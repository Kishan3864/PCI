'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

export function CopyBlock({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div>
      {label ? <p className="mb-1 text-xs font-medium text-slate-500">{label}</p> : null}
      <div className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 p-3">
        <code className="flex-1 break-all text-xs leading-5 text-slate-800">{value}</code>
        <button
          type="button"
          aria-label="Copy to clipboard"
          className="shrink-0 rounded p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
          onClick={async () => {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
