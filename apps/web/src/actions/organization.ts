'use server';

import { planAllows } from '@scriptproof/core';
import { schema } from '@scriptproof/db';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireOrg } from '@/lib/org';
import { deleteArtifact, writeArtifact } from '@/lib/storage';
import type { ActionState } from './types';

const ORG_SETTINGS_PATH = '/app/settings/organization';

/** Renames the organization (owner only) — shown in the header, emails and reports. */
export async function renameOrganization(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { org, role } = await requireOrg();
  if (role !== 'owner') {
    return { ok: false, message: 'Only the organization owner can rename it.' };
  }

  const name = String(formData.get('name') ?? '').trim();
  if (name.length < 2 || name.length > 100) {
    return { ok: false, message: 'Name must be between 2 and 100 characters.' };
  }

  await db.update(schema.orgs).set({ name }).where(eq(schema.orgs.id, org.id));
  revalidatePath('/app', 'layout');
  return { ok: true, message: 'Organization renamed.' };
}

/** Strict server-side check: only real Slack incoming-webhook URLs are accepted. */
function isSlackWebhookUrl(raw: string): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  return (
    url.protocol === 'https:' &&
    url.hostname === 'hooks.slack.com' &&
    url.pathname.startsWith('/services/')
  );
}

/** Saves the org Slack webhook (Pro+ / Agency). */
export async function saveSlackWebhook(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { org } = await requireOrg();
  if (!planAllows(org.plan, 'slackAlerts')) {
    return { ok: false, message: 'Slack alerts require the Pro plan or higher.' };
  }

  const raw = String(formData.get('webhookUrl') ?? '').trim();
  if (!isSlackWebhookUrl(raw)) {
    return {
      ok: false,
      message: 'Enter a Slack incoming-webhook URL (https://hooks.slack.com/services/…).',
    };
  }

  await db.update(schema.orgs).set({ slackWebhookUrl: raw }).where(eq(schema.orgs.id, org.id));
  revalidatePath(ORG_SETTINGS_PATH);
  return { ok: true, message: 'Slack webhook saved. Critical alerts will now post to Slack.' };
}

/** Posts a test message to the saved webhook, from the server, and reports honestly. */
export async function sendSlackTest(_prev: ActionState, _formData: FormData): Promise<ActionState> {
  const { org } = await requireOrg();
  if (!planAllows(org.plan, 'slackAlerts')) {
    return { ok: false, message: 'Slack alerts require the Pro plan or higher.' };
  }
  if (!org.slackWebhookUrl || !isSlackWebhookUrl(org.slackWebhookUrl)) {
    return { ok: false, message: 'Save a Slack webhook first.' };
  }

  try {
    const res = await fetch(org.slackWebhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        text: `:white_check_mark: ScriptProof test message — Slack alerts are wired up for ${org.name}.`,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      return { ok: false, message: `Slack rejected the message (HTTP ${res.status}).` };
    }
    return { ok: true, message: 'Test message delivered — check your Slack channel.' };
  } catch (error) {
    const reason = error instanceof Error && error.name === 'TimeoutError' ? 'timed out' : 'failed';
    return { ok: false, message: `Could not reach Slack (request ${reason}).` };
  }
}

/** Removes the saved Slack webhook. */
export async function removeSlackWebhook(
  _prev: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const { org } = await requireOrg();
  await db.update(schema.orgs).set({ slackWebhookUrl: null }).where(eq(schema.orgs.id, org.id));
  revalidatePath(ORG_SETTINGS_PATH);
  return { ok: true, message: 'Slack webhook removed.' };
}

const MAX_LOGO_BYTES = 1024 * 1024; // 1 MB

/** Returns 'png' | 'jpg' when the magic bytes are a real PNG/JPEG, else null. */
function sniffImage(bytes: Buffer): 'png' | 'jpg' | null {
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return 'png';
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'jpg';
  }
  return null;
}

/** Uploads the white-label logo (Agency only). PNG/JPEG, max 1 MB, magic-byte checked. */
export async function uploadLogo(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { org } = await requireOrg();
  if (!planAllows(org.plan, 'whiteLabel')) {
    return { ok: false, message: 'White-label branding requires the Agency plan.' };
  }

  const file = formData.get('logo');
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: 'Choose a PNG or JPEG file to upload.' };
  }
  if (file.size > MAX_LOGO_BYTES) {
    return { ok: false, message: 'Logo must be 1 MB or smaller.' };
  }
  if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
    return { ok: false, message: 'Logo must be a PNG or JPEG image.' };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = sniffImage(bytes);
  if (!ext || (ext === 'png') !== (file.type === 'image/png')) {
    return { ok: false, message: 'File content does not look like a valid PNG or JPEG.' };
  }

  const relPath = `logos/${org.id}.${ext}`;
  await writeArtifact(relPath, bytes);
  // Remove a stale file left behind by a format switch (png -> jpg or back).
  if (org.logo && org.logo !== relPath && org.logo.startsWith('logos/')) {
    try {
      await deleteArtifact(org.logo);
    } catch {
      // best effort — the DB pointer below is what matters
    }
  }
  await db.update(schema.orgs).set({ logo: relPath }).where(eq(schema.orgs.id, org.id));
  revalidatePath(ORG_SETTINGS_PATH);
  return { ok: true, message: 'Logo uploaded. It now appears on your Evidence Packs.' };
}

/** Removes the white-label logo (file + DB pointer). */
export async function removeLogo(_prev: ActionState, _formData: FormData): Promise<ActionState> {
  const { org } = await requireOrg();
  if (org.logo?.startsWith('logos/')) {
    try {
      await deleteArtifact(org.logo);
    } catch {
      // best effort — clearing the DB pointer is what matters
    }
  }
  await db.update(schema.orgs).set({ logo: null }).where(eq(schema.orgs.id, org.id));
  revalidatePath(ORG_SETTINGS_PATH);
  return { ok: true, message: 'Logo removed.' };
}
