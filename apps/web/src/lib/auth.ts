import { assessSignupEmail } from '@scriptproof/core/email-guard';
import { schema } from '@scriptproof/db';
import { renderVerifyEmail } from '@scriptproof/email';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import { nextCookies } from 'better-auth/next-js';
import { organization } from 'better-auth/plugins';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { requireEnv } from './env';
import { mailer } from './mailer';

// Passwords that clear the 10-char minimum but are still on every cracking
// wordlist. Checked case-insensitively at signup.
const WEAK_PASSWORDS = new Set([
  'password123',
  'password1234',
  'password12345',
  '1234567890',
  '12345678910',
  'qwertyuiop',
  'qwerty123456',
  'iloveyou123',
  'welcome12345',
  'admin1234567',
  'letmein12345',
  'sunshine1234',
  'football1234',
  'monkey123456',
  'dragon123456',
]);

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
      rateLimit: schema.rateLimits,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 10,
    maxPasswordLength: 128,
  },
  // Server-side, DATABASE-backed rate limiting (survives restarts, shared
  // across instances). Tight custom windows on the abuse-prone endpoints.
  rateLimit: {
    enabled: true,
    storage: 'database',
    modelName: 'rateLimit',
    window: 60,
    max: 60,
    customRules: {
      '/sign-in/email': { window: 60, max: 5 },
      '/sign-up/email': { window: 3600, max: 5 },
      '/forget-password': { window: 3600, max: 3 },
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const rendered = await renderVerifyEmail({ name: user.name, verifyUrl: url });
      await mailer.send({ to: user.email, ...rendered });
    },
  },
  hooks: {
    // Reject wordlist passwords before Better Auth ever hashes them.
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === '/sign-up/email') {
        const pw = typeof ctx.body?.password === 'string' ? ctx.body.password : '';
        if (WEAK_PASSWORDS.has(pw.toLowerCase())) {
          throw new APIError('BAD_REQUEST', {
            message:
              'That password appears on common-password lists. Please choose a stronger, unique password.',
          });
        }
      }
    }),
  },
  databaseHooks: {
    user: {
      create: {
        // Fraud gate BEFORE any account row exists: strict syntax, provider
        // typo detection, disposable-domain blocklist, and a LIVE DNS/MX check
        // for company domains. Runs in addition to the verification email.
        before: async (user) => {
          const verdict = await assessSignupEmail(user.email, {
            testMode: process.env.SCRIPTPROOF_TEST_MODE === '1',
          });
          if (!verdict.ok) {
            throw new APIError('BAD_REQUEST', { message: verdict.message });
          }
          return { data: user };
        },
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
