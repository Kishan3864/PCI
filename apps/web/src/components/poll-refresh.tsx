'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** Refreshes the current server component every `intervalMs` while mounted. */
export function PollRefresh({ intervalMs = 2500 }: { intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);
  return null;
}
