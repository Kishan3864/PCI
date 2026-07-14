'use server';

import {
  FREE_SCAN_DAILY_LIMIT,
  freeScanEmailSchema,
  freeScanSubmitSchema,
  isValidSiteDomain,
  normalizeDomain,
} from '@scriptproof/core';
import { schema } from '@scriptproof/db';
import { and, count, eq, gte } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { isTestMode } from '@/lib/env';
import { enqueueFreeScan } from '@/lib/queue';
import type { ActionState } from './types';

async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return h.get('x-real-ip') ?? '0.0.0.0';
}

export async function submitFreeScan(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = freeScanSubmitSchema.safeParse({ url: formData.get('url') });
  if (!parsed.success) {
    return { ok: false, message: 'Enter a valid URL, e.g. https://yourstore.com/checkout' };
  }

  let host: string;
  try {
    const u = new URL(parsed.data.url);
    if (u.protocol !== 'https:' && !(isTestMode() && u.protocol === 'http:')) {
      return { ok: false, message: 'Only https:// URLs can be scanned.' };
    }
    host = u.host;
  } catch {
    return { ok: false, message: 'That does not look like a valid URL.' };
  }

  const domain = normalizeDomain(host);
  if (!domain || !isValidSiteDomain(domain, { testMode: isTestMode() })) {
    return { ok: false, message: 'Enter a public website address (no internal or private hosts).' };
  }

  const ip = await clientIp();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [{ value: recent } = { value: 0 }] = await db
    .select({ value: count() })
    .from(schema.freeScans)
    .where(and(eq(schema.freeScans.ip, ip), gte(schema.freeScans.createdAt, since)));
  if (recent >= FREE_SCAN_DAILY_LIMIT) {
    return {
      ok: false,
      message: `Free scans are limited to ${FREE_SCAN_DAILY_LIMIT} per day. Start a free trial for unlimited monitoring.`,
    };
  }

  const [row] = await db
    .insert(schema.freeScans)
    .values({ url: parsed.data.url, ip, status: 'queued' })
    .returning();
  if (!row) return { ok: false, message: 'Could not start the scan. Try again.' };

  await enqueueFreeScan(row.id);
  redirect(`/free-scan/${row.id}`);
}

/** Email gate: records the email and unlocks the one-page PDF download. */
export async function emailFreeScanPdf(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = freeScanEmailSchema.safeParse({
    scanId: formData.get('scanId'),
    email: formData.get('email'),
  });
  if (!parsed.success) return { ok: false, message: 'Enter a valid email address.' };

  const row = await db.query.freeScans.findFirst({
    where: eq(schema.freeScans.id, parsed.data.scanId),
  });
  if (!row || row.status !== 'done') {
    return { ok: false, message: 'Scan not ready yet.' };
  }

  await db
    .update(schema.freeScans)
    .set({ email: parsed.data.email })
    .where(eq(schema.freeScans.id, row.id));

  return { ok: true, message: 'ready' };
}
