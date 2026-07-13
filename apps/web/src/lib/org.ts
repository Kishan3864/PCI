import 'server-only';
import { schema, type orgs } from '@scriptproof/db';
import { and, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth, type Session } from './auth';
import { db } from './db';

export type Org = typeof orgs.$inferSelect;

export interface OrgContext {
  session: Session;
  org: Org;
  role: string;
}

export async function getSession(): Promise<Session | null> {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}

/** Resolves the caller's active org and membership; redirects when signed out. */
export async function requireOrg(): Promise<OrgContext> {
  const session = await requireSession();
  const userId = session.user.id;

  let membership = session.session.activeOrganizationId
    ? await db.query.orgMembers.findFirst({
        where: and(
          eq(schema.orgMembers.userId, userId),
          eq(schema.orgMembers.organizationId, session.session.activeOrganizationId),
        ),
      })
    : undefined;
  membership ??= await db.query.orgMembers.findFirst({
    where: eq(schema.orgMembers.userId, userId),
  });
  if (!membership) throw new Error('Signed-in user has no organization');

  const org = await db.query.orgs.findFirst({
    where: eq(schema.orgs.id, membership.organizationId),
  });
  if (!org) throw new Error('Organization not found');

  return { session, org, role: membership.role };
}

/** Loads a site and asserts it belongs to the caller's org. */
export async function requireSite(siteId: string) {
  const ctx = await requireOrg();
  const site = await db.query.sites.findFirst({
    where: and(eq(schema.sites.id, siteId), eq(schema.sites.orgId, ctx.org.id)),
  });
  if (!site) redirect('/app');
  return { ...ctx, site };
}
