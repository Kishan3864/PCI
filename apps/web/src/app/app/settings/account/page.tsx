import { schema } from '@scriptproof/db';
import { desc, eq } from 'drizzle-orm';
import { KeyRound, MonitorSmartphone, UserRound } from 'lucide-react';
import type { Metadata } from 'next';
import { revokeSession } from '@/actions/account';
import { ActionButton } from '@/components/action-button';
import { ChangePasswordForm, ProfileNameForm } from '@/components/account-forms';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { GradientText, Reveal } from '@/components/visual';
import { db } from '@/lib/db';
import { requireOrg } from '@/lib/org';
import { formatDateTime } from '@/lib/utils';

export const metadata: Metadata = { title: 'Account & security' };

/** Rough, dependency-free UA summary: browser + OS is enough to recognize a session. */
function describeUserAgent(ua: string | null): string {
  if (!ua) return 'Unknown device';
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /OPR\//.test(ua)
      ? 'Opera'
      : /Chrome\//.test(ua)
        ? 'Chrome'
        : /Firefox\//.test(ua)
          ? 'Firefox'
          : /Safari\//.test(ua)
            ? 'Safari'
            : 'Browser';
  const os = /Windows/.test(ua)
    ? 'Windows'
    : /Mac OS X/.test(ua)
      ? 'macOS'
      : /Android/.test(ua)
        ? 'Android'
        : /iPhone|iPad/.test(ua)
          ? 'iOS'
          : /Linux/.test(ua)
            ? 'Linux'
            : 'Unknown OS';
  return `${browser} on ${os}`;
}

export default async function AccountSettingsPage() {
  const { session } = await requireOrg();

  const sessions = await db.query.sessions.findMany({
    where: eq(schema.sessions.userId, session.user.id),
    orderBy: desc(schema.sessions.updatedAt),
  });
  const activeSessions = sessions.filter((s) => s.expiresAt > new Date());

  return (
    <div className="space-y-8">
      <Reveal>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900">
            Account &amp; <GradientText>security</GradientText>
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Your profile, password and active sessions.
          </p>
        </div>
      </Reveal>

      {/* ── Profile ─────────────────────────────────────────────────── */}
      <Reveal delay={80}>
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[2px] bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
                <UserRound className="h-5 w-5" />
              </div>
              <div className="space-y-1.5">
                <CardTitle className="text-base">Profile</CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-2">
                  {session.user.email}
                  {session.user.emailVerified ? (
                    <Badge variant="success">verified</Badge>
                  ) : (
                    <Badge variant="secondary">unverified</Badge>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ProfileNameForm currentName={session.user.name} />
          </CardContent>
        </Card>
      </Reveal>

      {/* ── Password ────────────────────────────────────────────────── */}
      <Reveal delay={160}>
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[2px] bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
                <KeyRound className="h-5 w-5" />
              </div>
              <div className="space-y-1.5">
                <CardTitle className="text-base">Password</CardTitle>
                <CardDescription>
                  Changing your password signs you out everywhere else automatically.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </Reveal>

      {/* ── Active sessions ─────────────────────────────────────────── */}
      <Reveal delay={240}>
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[2px] bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
                <MonitorSmartphone className="h-5 w-5" />
              </div>
              <div className="space-y-1.5">
                <CardTitle className="text-base">Active sessions</CardTitle>
                <CardDescription>
                  Everywhere your account is currently signed in. Sign out anything you don’t
                  recognize.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>IP address</TableHead>
                  <TableHead>Signed in</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeSessions.map((s) => {
                  const isCurrent = s.token === session.session.token;
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium text-navy-900">
                        {describeUserAgent(s.userAgent)}
                        {isCurrent ? (
                          <Badge variant="brand" className="ml-2">
                            this device
                          </Badge>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-slate-600">{s.ipAddress || '—'}</TableCell>
                      <TableCell className="text-slate-500">{formatDateTime(s.createdAt)}</TableCell>
                      <TableCell className="text-slate-500">{formatDateTime(s.expiresAt)}</TableCell>
                      <TableCell className="text-right">
                        {isCurrent ? (
                          <span className="text-xs text-slate-400">current</span>
                        ) : (
                          <ActionButton
                            action={revokeSession}
                            fields={{ sessionId: s.id }}
                            variant="outline"
                            size="sm"
                          >
                            Sign out
                          </ActionButton>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
