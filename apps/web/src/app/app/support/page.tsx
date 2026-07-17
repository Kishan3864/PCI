import { schema } from '@scriptproof/db';
import { desc, eq } from 'drizzle-orm';
import {
  BookOpen,
  Clock,
  ExternalLink,
  LifeBuoy,
  Mail,
  MessageSquarePlus,
  ShieldCheck,
  Ticket,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SupportTicketForm } from '@/components/support-ticket-form';
import { GradientText, Reveal } from '@/components/visual';
import { db } from '@/lib/db';
import { requireOrg } from '@/lib/org';
import { formatDateTime } from '@/lib/utils';

export const metadata: Metadata = { title: 'Support' };

const STATUS_VARIANT: Record<string, BadgeProps['variant']> = {
  open: 'info',
  in_progress: 'brand',
  resolved: 'success',
  closed: 'secondary',
};

const PRIORITY_VARIANT: Record<string, BadgeProps['variant']> = {
  low: 'secondary',
  normal: 'info',
  high: 'brand',
  urgent: 'critical',
};

const CATEGORY_LABEL: Record<string, string> = {
  billing: 'Billing',
  technical: 'Technical',
  compliance: 'Compliance',
  feature_request: 'Feature request',
  other: 'Other',
};

const resources = [
  { href: '/how-it-works', label: 'How ScriptProof works', icon: BookOpen },
  { href: '/pricing', label: 'Plans & what they include', icon: Ticket },
  { href: '/security', label: 'Security practices', icon: ShieldCheck },
  { href: '/bot', label: 'About our crawler (ScriptProofBot)', icon: ExternalLink },
];

export default async function SupportPage() {
  const { org, session } = await requireOrg();

  const tickets = await db.query.supportTickets.findMany({
    where: eq(schema.supportTickets.orgId, org.id),
    orderBy: desc(schema.supportTickets.createdAt),
    limit: 50,
  });

  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'support@scriptproof.com';
  const isAgency = org.plan === 'agency';

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Reveal>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900">
            Support &amp; <GradientText>help</GradientText>
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Raise a ticket, track its status, or reach us directly. Replies go to{' '}
            <span className="font-medium text-navy-900">{session.user.email}</span>.
          </p>
        </div>
      </Reveal>

      <div className="grid items-start gap-6 lg:grid-cols-5">
        {/* ── New ticket ─────────────────────────────────────────────── */}
        <Reveal delay={80} className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[2px] bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
                  <MessageSquarePlus className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <CardTitle className="text-base">Raise a support ticket</CardTitle>
                  <CardDescription>
                    Tell us what is wrong — we track every ticket and reply by email.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <SupportTicketForm />
            </CardContent>
          </Card>
        </Reveal>

        {/* ── Contact channels ───────────────────────────────────────── */}
        <div className="space-y-6 lg:col-span-2">
          <Reveal delay={140}>
            <Card>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[2px] bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
                    <LifeBuoy className="h-5 w-5" />
                  </div>
                  <div className="space-y-1.5">
                    <CardTitle className="text-base">Contact & response times</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <p className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 shrink-0 text-blue-600" />
                  <a
                    href={`mailto:${supportEmail}`}
                    className="font-semibold text-blue-700 underline-offset-4 hover:underline"
                  >
                    {supportEmail}
                  </a>
                </p>
                <p className="flex items-start gap-2.5">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  <span>
                    First reply usually within <b>1 business day</b>
                    {isAgency ? (
                      <>
                        {' '}
                        — <Badge variant="brand">priority support</Badge> on your Agency plan
                      </>
                    ) : (
                      '. Agency plan includes priority support.'
                    )}
                  </span>
                </p>
                <p className="flex items-start gap-2.5">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  <span>
                    Suspected skimming on a live checkout? Mark the ticket <b>Urgent</b> — those go
                    to the front of the queue.
                  </span>
                </p>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delay={200}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Helpful resources</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5 text-sm">
                  {resources.map((r) => (
                    <li key={r.href}>
                      <Link
                        href={r.href}
                        className="flex items-center gap-2.5 text-slate-600 transition-colors hover:text-blue-700"
                      >
                        <r.icon className="h-4 w-4 shrink-0 text-blue-600" />
                        {r.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </div>

      {/* ── Ticket history ─────────────────────────────────────────────── */}
      <Reveal delay={260}>
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[2px] bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
                <Ticket className="h-5 w-5" />
              </div>
              <div className="space-y-1.5">
                <CardTitle className="text-base">Your tickets</CardTitle>
                <CardDescription>
                  Every ticket raised by {org.name}, newest first.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">
                No tickets yet. When you raise one, it appears here with its status.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs text-slate-500">
                        {t.id.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell className="max-w-[280px] truncate font-medium text-navy-900">
                        {t.subject}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {CATEGORY_LABEL[t.category] ?? t.category}
                      </TableCell>
                      <TableCell>
                        <Badge variant={PRIORITY_VARIANT[t.priority] ?? 'secondary'}>
                          {t.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[t.status] ?? 'secondary'}>
                          {t.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {formatDateTime(t.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
