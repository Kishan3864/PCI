'use client';

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
    <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 py-3 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 font-medium text-slate-800">
          {page.label}
          {!page.isActive ? <Badge variant="secondary">paused</Badge> : null}
        </p>
        <p className="truncate font-mono text-xs text-slate-500">{page.url}</p>
        {freqState && !freqState.ok ? (
          <p className="text-xs text-red-600">{freqState.message}</p>
        ) : null}
      </div>

      <form action={freqAction} className="flex items-center gap-1.5">
        <input type="hidden" name="pageId" value={page.id} />
        <select
          name="scanFrequency"
          defaultValue={page.scanFrequency}
          className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs shadow-sm"
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
        className="text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        Delete
      </ActionButton>
    </div>
  );
}
