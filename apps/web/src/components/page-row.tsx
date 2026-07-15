'use client';

import { Globe } from 'lucide-react';
import { useActionState } from 'react';
import { deletePage, updatePage } from '@/actions/pages';
import { scanNow } from '@/actions/sites';
import { ActionButton } from '@/components/action-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PageRowProps {
  page: {
    id: string;
    siteId: string;
    url: string;
    label: string;
    scanFrequency: 'daily' | '6h';
    isActive: boolean;
    lastScanAt: string | null;
  };
  verified: boolean;
  allow6h: boolean;
}

export function PageRow({ page, verified, allow6h }: PageRowProps) {
  const [freqState, freqAction, freqPending] = useActionState(updatePage, null);

  return (
    <div className="-mx-3 flex flex-wrap items-center gap-3 rounded-[2px] border-b border-slate-100 px-3 py-3 transition-colors last:border-0 hover:bg-blue-50/40">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[2px] bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-600/20">
          <Globe className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-medium text-navy-900">
            {page.label}
            {!page.isActive ? <Badge variant="secondary">paused</Badge> : null}
          </p>
          <p className="truncate font-mono text-xs text-slate-500">{page.url}</p>
          {freqState && !freqState.ok ? (
            <p className="text-xs text-rose-600">{freqState.message}</p>
          ) : null}
        </div>
      </div>

      <form action={freqAction} className="flex items-center gap-1.5">
        <input type="hidden" name="pageId" value={page.id} />
        <select
          name="scanFrequency"
          defaultValue={page.scanFrequency}
          className="h-8 rounded-[2px] border border-slate-300 bg-white px-2 text-xs text-navy-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
        >
          <option value="daily">Daily</option>
          <option value="6h" disabled={!allow6h}>
            Every 6h{allow6h ? '' : ' (Pro)'}
          </option>
        </select>
        <Button type="submit" variant="ghost" size="sm" disabled={freqPending}>
          Save
        </Button>
      </form>

      <ActionButton
        action={updatePage}
        fields={{ pageId: page.id, isActive: String(!page.isActive) }}
        variant="outline"
        size="sm"
      >
        {page.isActive ? 'Pause' : 'Resume'}
      </ActionButton>

      {verified && page.isActive ? (
        <ActionButton
          action={scanNow}
          fields={{ siteId: page.siteId, pageId: page.id }}
          variant="outline"
          size="sm"
        >
          Scan now
        </ActionButton>
      ) : null}

      <ActionButton
        action={deletePage}
        fields={{ pageId: page.id }}
        variant="ghost"
        size="sm"
        className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
      >
        Delete
      </ActionButton>
    </div>
  );
}
