'use server';

import { schema } from '@scriptproof/db';
import { APIError } from 'better-auth/api';
import { and, eq, ne } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { requireSession } from '@/lib/org';
import type { ActionState } from './types';

const ACCOUNT_PATH = '/app/settings/account';

const nameSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(100),
});

/** Updates the signed-in user's display name. */
export async function updateProfileName(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();

  const parsed = nameSchema.safeParse({ name: formData.get('name') });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'Invalid name.' };
  }

  await db
    .update(schema.users)
    .set({ name: parsed.data.name, updatedAt: new Date() })
    .where(eq(schema.users.id, session.user.id));

  revalidatePath(ACCOUNT_PATH);
  return { ok: true, message: 'Name updated.' };
}

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password.'),
  newPassword: z
    .string()
    .min(10, 'New password must be at least 10 characters.')
    .max(128, 'New password must be at most 128 characters.'),
});

/**
 * Changes the password through Better Auth (verifies the current password,
 * re-hashes, and revokes every other session so a stolen session can't ride
 * along after a reset).
 */
export async function changePassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  try {
    await auth.api.changePassword({
      body: {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
        revokeOtherSessions: true,
      },
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError) {
      return { ok: false, message: error.message || 'Current password is incorrect.' };
    }
    return { ok: false, message: 'Could not change the password. Try again.' };
  }

  revalidatePath(ACCOUNT_PATH);
  return { ok: true, message: 'Password changed. Other devices have been signed out.' };
}

const revokeSchema = z.object({ sessionId: z.string().min(1) });

/** Signs out one of the caller's other sessions (never the current one). */
export async function revokeSession(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();

  const parsed = revokeSchema.safeParse({ sessionId: formData.get('sessionId') });
  if (!parsed.success) return { ok: false, message: 'Invalid request' };

  const [deleted] = await db
    .delete(schema.sessions)
    .where(
      and(
        eq(schema.sessions.id, parsed.data.sessionId),
        eq(schema.sessions.userId, session.user.id),
        ne(schema.sessions.token, session.session.token),
      ),
    )
    .returning();
  if (!deleted) {
    return { ok: false, message: 'Session not found (or it is your current session).' };
  }

  revalidatePath(ACCOUNT_PATH);
  return { ok: true, message: 'Session signed out.' };
}
