import { hashPassword } from 'better-auth/crypto';
import { eq } from 'drizzle-orm';
import { loadRootEnv } from './env';
import { createDb } from './index';
import { accounts, orgMembers, orgs, pages, sites, users } from './schema';

loadRootEnv();

const DEMO_EMAIL = 'demo@scriptproof.local';
const DEMO_PASSWORD = 'demo-password-123';
const DEMO_ORG_SLUG = 'demo-merchant';
const FIXTURE_PORT = process.env.FIXTURE_PORT ?? '4820';
const FIXTURE_DOMAIN = `localhost:${FIXTURE_PORT}`;

const { db, pool } = createDb();

try {
  // Idempotent: wipe the demo user/org (cascades take the rest) and recreate.
  await db.delete(users).where(eq(users.email, DEMO_EMAIL));
  await db.delete(orgs).where(eq(orgs.slug, DEMO_ORG_SLUG));

  const [user] = await db
    .insert(users)
    .values({ name: 'Demo Merchant', email: DEMO_EMAIL, emailVerified: true })
    .returning();
  if (!user) throw new Error('failed to insert demo user');

  await db.insert(accounts).values({
    accountId: user.id,
    providerId: 'credential',
    userId: user.id,
    password: await hashPassword(DEMO_PASSWORD),
  });

  const [org] = await db
    .insert(orgs)
    .values({ name: 'Demo Merchant', slug: DEMO_ORG_SLUG, plan: 'pro' })
    .returning();
  if (!org) throw new Error('failed to insert demo org');

  await db.insert(orgMembers).values({ organizationId: org.id, userId: user.id, role: 'owner' });

  const [site] = await db
    .insert(sites)
    .values({
      orgId: org.id,
      domain: FIXTURE_DOMAIN,
      verifyToken: 'demo-verify-token',
      verifiedAt: new Date(),
      verifyMethod: 'dns',
    })
    .returning();
  if (!site) throw new Error('failed to insert demo site');

  await db.insert(pages).values([
    { siteId: site.id, url: `http://${FIXTURE_DOMAIN}/checkout`, label: 'Checkout' },
    { siteId: site.id, url: `http://${FIXTURE_DOMAIN}/`, label: 'Home' },
  ]);

  console.log('Seeded demo data:');
  console.log(`  login:    ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(`  site:     ${FIXTURE_DOMAIN} (verified; fixture pages served by the worker)`);
  console.log('  next:     open the dashboard and press "Scan now" to create the baseline');
} finally {
  await pool.end();
}
