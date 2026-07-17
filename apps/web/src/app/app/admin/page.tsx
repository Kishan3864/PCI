import { schema } from '@scriptproof/db';
import { count, desc, eq, gte, sql } from 'drizzle-orm';
import { Activity, Building2, Globe, LifeBuoy, Search, ShieldCheck, Users } from 'lucide-react';
import type { Metadata } from 'next';
import { adminUpdateTicketStatus } from '@/actions/support';
import { ActionButton } from '@/components/action-button';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { requireAdmin } from '@/lib/admin';
import { db } from '@/lib/db';
import { formatDateTime } from '@/lib/utils';

export const metadata: Metadata = { title: 'Admin' };

const PLAN_VARIANT: Record<string, BadgeProps['variant']> = {
  starter: 'secondary',
  pro: 'brand',
  agency: 'default',
};

const SCAN_VARIANT: Record<string, BadgeProps['variant']> = {
  queued: 'secondary',
  running: 'info',
  success: 'success',
  done: 'success',
  error: 'critical',
};

const TICKET_STATUS_VARIANT: Record<string, BadgeProps['variant']> = {
  open: 'info',
  in_progress: 'brand',
  resolved: 'success',
  closed: 'secondary',
};

const TICKET_PRIORITY_VARIANT: Record<string, BadgeProps['variant']> = {
  low: 'secondary',
  normal: 'info',
  high: 'brand',
  urgent: 'critical',
};

function formatDuration(start: Date, end: Date | null): string {
  if (!end) return '—';
  const ms = end.getTime() - start.getTime();
  if (ms < 0) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default async function AdminPage() {
  await requireAdmin();

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [planRows, [userStats], [siteStats], [scanStats], [freeScanStats]] = await Promise.all([
    db
      .select({ plan: schema.orgs.plan, value: count() })
      .from(schema.orgs)
      .groupBy(schema.orgs.plan),
    db.select({ total: count() }).from(schema.users),
    db.select({ total: count(), verified: count(schema.sites.verifiedAt) }).from(schema.sites),
    db
      .select({
        total: count(),
        failures: sql<number>`count(*) filter (where ${schema.scans.status} = 'error')`.mapWith(
          Number,
        ),
      })
      .from(schema.scans)
      .where(gte(schema.scans.startedAt, dayAgo)),
    db
      .select({ total: count() })
      .from(schema.freeScans)
      .where(gte(schema.freeScans.createdAt, weekAgo)),
  ]);

  const plans = new Map(planRows.map((r) => [r.plan, r.value]));
  const totalOrgs = planRows.reduce((sum, r) => sum + r.value, 0);

  const [orgRows, scanRows, freeScanRows, ticketRows] = await Promise.all([
    db
      .select({
        id: schema.orgs.id,
        name: schema.orgs.name,
        plan: schema.orgs.plan,
        createdAt: schema.orgs.createdAt,
        trialEndsAt: schema.orgs.trialEndsAt,
        sitesCount: count(schema.sites.id),
        subStatus: schema.subscriptions.status,
        renewsAt: schema.subscriptions.renewsAt,
      })
      .from(schema.orgs)
      .leftJoin(schema.subscriptions, eq(schema.subscriptions.orgId, schema.orgs.id))
      .leftJoin(schema.sites, eq(schema.sites.orgId, schema.orgs.id))
      .groupBy(schema.orgs.id, schema.subscriptions.orgId)
      .orderBy(desc(schema.orgs.createdAt))
      .limit(50),
    db
      .select({
        id: schema.scans.id,
        domain: schema.sites.domain,
        status: schema.scans.status,
        startedAt: schema.scans.startedAt,
        finishedAt: schema.scans.finishedAt,
      })
      .from(schema.scans)
      .innerJoin(schema.pages, eq(schema.scans.pageId, schema.pages.id))
      .innerJoin(schema.sites, eq(schema.pages.siteId, schema.sites.id))
      .orderBy(desc(schema.scans.startedAt))
      .limit(20),
    db
      .select({
        id: schema.freeScans.id,
        url: schema.freeScans.url,
        status: schema.freeScans.status,
        createdAt: schema.freeScans.createdAt,
        hasEmail: sql<boolean>`${schema.freeScans.email} is not null`,
      })
      .from(schema.freeScans)
      .orderBy(desc(schema.freeScans.createdAt))
      .limit(20),
    db
      .select({
        id: schema.supportTickets.id,
        subject: schema.supportTickets.subject,
        category: schema.supportTickets.category,
        priority: schema.supportTickets.priority,
        status: schema.supportTickets.status,
        createdAt: schema.supportTickets.createdAt,
        orgName: schema.orgs.name,
        userEmail: schema.users.email,
      })
      .from(schema.supportTickets)
      .innerJoin(schema.orgs, eq(schema.supportTickets.orgId, schema.orgs.id))
      .innerJoin(schema.users, eq(schema.supportTickets.userId, schema.users.id))
      .orderBy(desc(schema.supportTickets.createdAt))
      .limit(50),
  ]);

  const openTicketCount = ticketRows.filter((t) =>
    (['open', 'in_progress'] as string[]).includes(t.status),
  ).length;

  const tiles = [
    {
      icon: Building2,
      label: 'Organizations',
      value: totalOrgs,
      detail: `starter ${plans.get('starter') ?? 0} · pro ${plans.get('pro') ?? 0} · agency ${plans.get('agency') ?? 0}`,
    },
    { icon: Users, label: 'Users', value: userStats?.total ?? 0, detail: 'all time' },
    {
      icon: Globe,
      label: 'Sites',
      value: siteStats?.total ?? 0,
      detail: `${siteStats?.verified ?? 0} verified · ${(siteStats?.total ?? 0) - (siteStats?.verified ?? 0)} unverified`,
    },
    {
      icon: Activity,
      label: 'Scans (24h)',
      value: scanStats?.total ?? 0,
      detail: `${scanStats?.failures ?? 0} failed`,
    },
    {
      icon: Search,
      label: 'Free scans (7d)',
      value: freeScanStats?.total ?? 0,
      detail: 'lead magnet',
    },
    {
      icon: LifeBuoy,
      label: 'Open tickets',
      value: openTicketCount,
      detail: 'support queue',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-navy-900">
          <ShieldCheck className="h-6 w-6 text-blue-700" /> Admin
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Read-only operations dashboard. All figures are live from the database.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="rounded-[2px] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tile.icon className="h-4 w-4 text-slate-400" /> {tile.label}
            </p>
            <p className="mt-2 font-display text-2xl font-bold text-blue-700">{tile.value}</p>
            <p className="mt-1 text-xs text-slate-600">{tile.detail}</p>
          </div>
        ))}
      </div>

      <section className="rounded-[2px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-display text-sm font-semibold text-navy-900">Organizations</h2>
          <p className="mt-0.5 text-xs text-slate-500">50 most recent, newest first</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Sites</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Trial ends</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orgRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-slate-500">
                  No organizations yet.
                </TableCell>
              </TableRow>
            ) : (
              orgRows.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium text-navy-900">{org.name}</TableCell>
                  <TableCell>
                    <Badge variant={PLAN_VARIANT[org.plan] ?? 'secondary'}>{org.plan}</Badge>
                  </TableCell>
                  <TableCell>{formatDateTime(org.createdAt)}</TableCell>
                  <TableCell>{org.sitesCount}</TableCell>
                  <TableCell>
                    {org.subStatus
                      ? `${org.subStatus} · renews ${formatDateTime(org.renewsAt)}`
                      : '—'}
                  </TableCell>
                  <TableCell>{formatDateTime(org.trialEndsAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>

      <section className="rounded-[2px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-display text-sm font-semibold text-navy-900">Recent scans</h2>
          <p className="mt-0.5 text-xs text-slate-500">Last 20 monitored-page scans</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Site</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scanRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-slate-500">
                  No scans yet.
                </TableCell>
              </TableRow>
            ) : (
              scanRows.map((scan) => (
                <TableRow key={scan.id}>
                  <TableCell className="font-medium text-navy-900">{scan.domain}</TableCell>
                  <TableCell>
                    <Badge variant={SCAN_VARIANT[scan.status] ?? 'secondary'}>{scan.status}</Badge>
                  </TableCell>
                  <TableCell>{formatDateTime(scan.startedAt)}</TableCell>
                  <TableCell>{formatDuration(scan.startedAt, scan.finishedAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>

      <section className="rounded-[2px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-display text-sm font-semibold text-navy-900">Support tickets</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Last 50 tickets across all organizations — {openTicketCount} awaiting a reply
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Org / user</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ticketRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-slate-500">
                  No support tickets yet.
                </TableCell>
              </TableRow>
            ) : (
              ticketRows.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs text-slate-500">
                    {t.id.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-navy-900">{t.orgName}</span>
                    <span className="block text-xs text-slate-500">{t.userEmail}</span>
                  </TableCell>
                  <TableCell className="max-w-[240px] truncate">{t.subject}</TableCell>
                  <TableCell>
                    <Badge variant={TICKET_PRIORITY_VARIANT[t.priority] ?? 'secondary'}>
                      {t.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={TICKET_STATUS_VARIANT[t.status] ?? 'secondary'}>
                      {t.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDateTime(t.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    {t.status === 'open' || t.status === 'in_progress' ? (
                      <ActionButton
                        action={adminUpdateTicketStatus}
                        fields={{ ticketId: t.id, status: 'resolved' }}
                        variant="outline"
                        size="sm"
                      >
                        Mark resolved
                      </ActionButton>
                    ) : (
                      <ActionButton
                        action={adminUpdateTicketStatus}
                        fields={{ ticketId: t.id, status: 'open' }}
                        variant="ghost"
                        size="sm"
                      >
                        Reopen
                      </ActionButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>

      <section className="rounded-[2px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-display text-sm font-semibold text-navy-900">Recent free scans</h2>
          <p className="mt-0.5 text-xs text-slate-500">Last 20 lead-magnet scans</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Email provided</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {freeScanRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-slate-500">
                  No free scans yet.
                </TableCell>
              </TableRow>
            ) : (
              freeScanRows.map((scan) => (
                <TableRow key={scan.id}>
                  <TableCell className="max-w-xs truncate font-medium text-navy-900">
                    {scan.url}
                  </TableCell>
                  <TableCell>
                    <Badge variant={SCAN_VARIANT[scan.status] ?? 'secondary'}>{scan.status}</Badge>
                  </TableCell>
                  <TableCell>{formatDateTime(scan.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant={scan.hasEmail ? 'success' : 'secondary'}>
                      {scan.hasEmail ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
