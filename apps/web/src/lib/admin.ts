import 'server-only';
import { notFound } from 'next/navigation';
import type { Session } from './auth';
import { getSession } from './org';

/**
 * Server-side admin gate. Admins are the emails listed in `ADMIN_EMAILS`
 * (comma-separated). Anyone else — including signed-out visitors and the
 * case where the env var is unset — gets a 404, never a 403, so the admin
 * area's existence does not leak.
 */
export async function requireAdmin(): Promise<Session> {
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  if (adminEmails.length === 0) notFound();

  const session = await getSession();
  if (!session || !adminEmails.includes(session.user.email.toLowerCase())) notFound();

  return session;
}
