'use server';

import { schema } from '@scriptproof/db';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin';
import { db } from '@/lib/db';
import { mailer } from '@/lib/mailer';
import { requireOrg } from '@/lib/org';
import type { ActionState } from './types';

const SUPPORT_PATH = '/app/support';

const ticketSchema = z.object({
  subject: z.string().trim().min(4, 'Subject must be at least 4 characters.').max(200),
  category: z.enum(['billing', 'technical', 'compliance', 'feature_request', 'other']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  message: z
    .string()
    .trim()
    .min(20, 'Please describe the issue in at least 20 characters.')
    .max(5000),
});

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/** Creates a support ticket, notifies the support inbox and confirms to the user. */
export async function createSupportTicket(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { org, session } = await requireOrg();

  const parsed = ticketSchema.safeParse({
    subject: formData.get('subject'),
    category: formData.get('category'),
    priority: formData.get('priority'),
    message: formData.get('message'),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const [ticket] = await db
    .insert(schema.supportTickets)
    .values({
      orgId: org.id,
      userId: session.user.id,
      subject: parsed.data.subject,
      category: parsed.data.category,
      priority: parsed.data.priority,
      message: parsed.data.message,
    })
    .returning();
  if (!ticket) return { ok: false, message: 'Could not create the ticket. Try again.' };

  const shortId = ticket.id.slice(0, 8).toUpperCase();
  const supportInbox = process.env.SUPPORT_EMAIL ?? process.env.EMAIL_FROM;

  // Email failures must not fail the ticket — it is already stored.
  try {
    if (supportInbox) {
      await mailer.send({
        to: supportInbox,
        subject: `[Ticket ${shortId}] [${parsed.data.priority}] ${parsed.data.subject}`,
        html: `<h2>New support ticket ${shortId}</h2>
<p><b>Org:</b> ${escapeHtml(org.name)} (${org.plan}) · <b>From:</b> ${escapeHtml(session.user.email)}</p>
<p><b>Category:</b> ${parsed.data.category} · <b>Priority:</b> ${parsed.data.priority}</p>
<hr />
<p style="white-space:pre-wrap">${escapeHtml(parsed.data.message)}</p>`,
        text: `New support ticket ${shortId}\nOrg: ${org.name} (${org.plan})\nFrom: ${session.user.email}\nCategory: ${parsed.data.category} · Priority: ${parsed.data.priority}\n\n${parsed.data.message}`,
      });
    }
    await mailer.send({
      to: session.user.email,
      subject: `We received your ticket ${shortId} — ${parsed.data.subject}`,
      html: `<h2>Your support ticket is in</h2>
<p>Hi ${escapeHtml(session.user.name)},</p>
<p>We received your ticket <b>${shortId}</b> (“${escapeHtml(parsed.data.subject)}”) and will reply to this email address — usually within one business day${org.plan === 'agency' ? ', with priority handling on your Agency plan' : ''}.</p>
<p>You can track its status anytime under <b>Support</b> in your ScriptProof dashboard.</p>
<hr />
<p style="white-space:pre-wrap;color:#475569">${escapeHtml(parsed.data.message)}</p>`,
      text: `Hi ${session.user.name},\n\nWe received your ticket ${shortId} ("${parsed.data.subject}") and will reply to this email address — usually within one business day.\n\nYour message:\n${parsed.data.message}`,
    });
  } catch {
    // Ticket stored; support team will still see it in the admin queue.
  }

  revalidatePath(SUPPORT_PATH);
  return {
    ok: true,
    message: `Ticket ${shortId} created. We emailed a confirmation to ${session.user.email} and will reply within one business day.`,
  };
}

const adminStatusSchema = z.object({
  ticketId: z.string().uuid(),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
});

/** Admin-only: moves a ticket through its lifecycle from the admin queue. */
export async function adminUpdateTicketStatus(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = adminStatusSchema.safeParse({
    ticketId: formData.get('ticketId'),
    status: formData.get('status'),
  });
  if (!parsed.success) return { ok: false, message: 'Invalid request' };

  const [updated] = await db
    .update(schema.supportTickets)
    .set({ status: parsed.data.status, updatedAt: new Date() })
    .where(eq(schema.supportTickets.id, parsed.data.ticketId))
    .returning();
  if (!updated) return { ok: false, message: 'Ticket not found' };

  revalidatePath('/app/admin');
  revalidatePath(SUPPORT_PATH);
  return { ok: true, message: `Ticket marked ${parsed.data.status.replace('_', ' ')}.` };
}
