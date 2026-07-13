import { schema } from '@scriptproof/db';
import { renderVerifyEmail } from '@scriptproof/email';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { organization } from 'better-auth/plugins';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { requireEnv } from './env';
import { mailer } from './mailer';

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return `${base || 'org'}-${crypto.randomUUID().slice(0, 8)}`;
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  secret: requireEnv('BETTER_AUTH_SECRET'),
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
      organization: schema.orgs,
      member: schema.orgMembers,
      invitation: schema.invitations,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const rendered = await renderVerifyEmail({ name: user.name, verifyUrl: url });
      await mailer.send({ to: user.email, ...rendered });
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Every user gets an org (they are its owner) the moment they sign up.
        after: async (user) => {
          const [org] = await db
            .insert(schema.orgs)
            .values({ name: user.name, slug: slugify(user.name) })
            .returning();
          if (!org) throw new Error('failed to create org for new user');
          await db
            .insert(schema.orgMembers)
            .values({ organizationId: org.id, userId: user.id, role: 'owner' });
        },
      },
    },
    session: {
      create: {
        // New sessions start scoped to the user's first org.
        before: async (session) => {
          const membership = await db.query.orgMembers.findFirst({
            where: eq(schema.orgMembers.userId, session.userId),
          });
          return {
            data: { ...session, activeOrganizationId: membership?.organizationId ?? null },
          };
        },
      },
    },
  },
  plugins: [organization(), nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
