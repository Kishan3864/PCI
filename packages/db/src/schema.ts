import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

const id = () =>
  text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = () =>
  timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow();
const updatedAt = () =>
  timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow();
const ts = (name: string) => timestamp(name, { withTimezone: true, mode: 'date' });

// ── Enums ────────────────────────────────────────────────────────────────────

export const planEnum = pgEnum('plan', ['starter', 'pro', 'agency']);
export const verifyMethodEnum = pgEnum('verify_method', ['dns', 'meta']);
export const scanFrequencyEnum = pgEnum('scan_frequency', ['daily', '6h']);
export const scanStatusEnum = pgEnum('scan_status', ['queued', 'running', 'success', 'error']);
export const scriptStatusEnum = pgEnum('script_status', ['pending', 'authorized', 'blocked']);
export const changeTypeEnum = pgEnum('change_type', [
  'new_script',
  'script_modified',
  'script_removed',
  'header_changed',
  'sri_removed',
]);
export const changeSeverityEnum = pgEnum('change_severity', ['info', 'warning', 'critical']);
export const alertChannelEnum = pgEnum('alert_channel', ['email', 'slack']);
export const alertStatusEnum = pgEnum('alert_status', ['sent', 'failed', 'skipped_dedupe']);
export const freeScanStatusEnum = pgEnum('free_scan_status', [
  'queued',
  'running',
  'done',
  'error',
]);

// ── Better Auth tables (model names mapped in apps/web auth config) ─────────

export const users = pgTable('users', {
  id: id(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const sessions = pgTable(
  'sessions',
  {
    id: id(),
    expiresAt: ts('expires_at').notNull(),
    token: text('token').notNull().unique(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    activeOrganizationId: text('active_org_id'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('sessions_user_id_idx').on(t.userId)],
);

export const accounts = pgTable(
  'accounts',
  {
    id: id(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: ts('access_token_expires_at'),
    refreshTokenExpiresAt: ts('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('accounts_user_id_idx').on(t.userId)],
);

export const verifications = pgTable(
  'verifications',
  {
    id: id(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: ts('expires_at').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('verifications_identifier_idx').on(t.identifier)],
);

export const orgs = pgTable('orgs', {
  id: id(),
  name: text('name').notNull(),
  slug: text('slug').unique(),
  logo: text('logo'),
  metadata: text('metadata'),
  plan: planEnum('plan').notNull().default('starter'),
  billingCustomerId: text('billing_customer_id'),
  trialEndsAt: ts('trial_ends_at').default(sql`now() + interval '14 days'`),
  slackWebhookUrl: text('slack_webhook_url'),
  createdAt: createdAt(),
});

export const orgMembers = pgTable(
  'org_members',
  {
    id: id(),
    organizationId: text('org_id')
      .notNull()
      .references(() => orgs.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').notNull().default('member'),
    createdAt: createdAt(),
  },
  (t) => [
    index('org_members_org_id_idx').on(t.organizationId),
    index('org_members_user_id_idx').on(t.userId),
    unique('org_members_org_user_uq').on(t.organizationId, t.userId),
  ],
);

export const invitations = pgTable(
  'invitations',
  {
    id: id(),
    organizationId: text('org_id')
      .notNull()
      .references(() => orgs.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    role: text('role'),
    status: text('status').notNull().default('pending'),
    expiresAt: ts('expires_at').notNull(),
    inviterId: text('inviter_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (t) => [index('invitations_org_id_idx').on(t.organizationId)],
);

// ── Product tables ───────────────────────────────────────────────────────────

export const sites = pgTable(
  'sites',
  {
    id: id(),
    orgId: text('org_id')
      .notNull()
      .references(() => orgs.id, { onDelete: 'cascade' }),
    domain: text('domain').notNull(),
    verifyToken: text('verify_token').notNull(),
    verifiedAt: ts('verified_at'),
    verifyMethod: verifyMethodEnum('verify_method'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('sites_org_id_idx').on(t.orgId),
    unique('sites_org_domain_uq').on(t.orgId, t.domain),
  ],
);

export const pages = pgTable(
  'pages',
  {
    id: id(),
    siteId: text('site_id')
      .notNull()
      .references(() => sites.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    label: text('label').notNull().default('Checkout'),
    scanFrequency: scanFrequencyEnum('scan_frequency').notNull().default('daily'),
    isActive: boolean('is_active').notNull().default(true),
    lastScanAt: ts('last_scan_at'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('pages_site_id_idx').on(t.siteId), unique('pages_site_url_uq').on(t.siteId, t.url)],
);

export const scans = pgTable(
  'scans',
  {
    id: id(),
    pageId: text('page_id')
      .notNull()
      .references(() => pages.id, { onDelete: 'cascade' }),
    startedAt: ts('started_at').notNull().defaultNow(),
    finishedAt: ts('finished_at'),
    status: scanStatusEnum('status').notNull().default('queued'),
    httpStatus: integer('http_status'),
    error: text('error'),
  },
  (t) => [index('scans_page_started_idx').on(t.pageId, t.startedAt)],
);

/** The 6.4.3 script inventory. One row per distinct script per site. */
export const scripts = pgTable(
  'scripts',
  {
    id: id(),
    siteId: text('site_id')
      .notNull()
      .references(() => sites.id, { onDelete: 'cascade' }),
    /** Identity key: normalized absolute URL (no query/fragment) or `inline:<sha256>`. */
    urlKey: text('url_key').notNull(),
    /** Full source URL as last observed; NULL for inline scripts. */
    srcUrl: text('src_url'),
    isInline: boolean('is_inline').notNull().default(false),
    status: scriptStatusEnum('status').notNull().default('pending'),
    justification: text('justification'),
    justifiedBy: text('justified_by').references(() => users.id, { onDelete: 'set null' }),
    justifiedAt: ts('justified_at'),
    firstSeenAt: ts('first_seen_at').notNull().defaultNow(),
    lastSeenAt: ts('last_seen_at').notNull().defaultNow(),
    /** Page this script was most recently observed on; anchors missing-streak tracking. */
    lastSeenPageId: text('last_seen_page_id').references(() => pages.id, { onDelete: 'set null' }),
    /** Consecutive scans of the anchoring page this script has been missing from. */
    missingStreak: integer('missing_streak').notNull().default(0),
    latestSha256: text('latest_sha256'),
    latestByteSize: integer('latest_byte_size'),
    latestSriPresent: boolean('latest_sri_present').notNull().default(false),
  },
  (t) => [
    index('scripts_site_id_idx').on(t.siteId),
    uniqueIndex('scripts_site_url_key_uq').on(t.siteId, t.urlKey),
  ],
);

export const scriptObservations = pgTable(
  'script_observations',
  {
    id: id(),
    scanId: text('scan_id')
      .notNull()
      .references(() => scans.id, { onDelete: 'cascade' }),
    scriptId: text('script_id')
      .notNull()
      .references(() => scripts.id, { onDelete: 'cascade' }),
    sha256: text('sha256').notNull(),
    byteSize: integer('byte_size'),
    sriPresent: boolean('sri_present').notNull().default(false),
    attrs: jsonb('attrs').$type<Record<string, string>>(),
  },
  (t) => [
    index('script_observations_scan_idx').on(t.scanId),
    index('script_observations_script_idx').on(t.scriptId),
  ],
);

/** 11.6.1 HTTP header monitoring: full response header set per scan. */
export const headerSnapshots = pgTable(
  'header_snapshots',
  {
    id: id(),
    scanId: text('scan_id')
      .notNull()
      .references(() => scans.id, { onDelete: 'cascade' }),
    headersJson: jsonb('headers_json').$type<Record<string, string>>().notNull(),
    headersHash: text('headers_hash').notNull(),
  },
  (t) => [uniqueIndex('header_snapshots_scan_uq').on(t.scanId)],
);

export const changes = pgTable(
  'changes',
  {
    id: id(),
    pageId: text('page_id')
      .notNull()
      .references(() => pages.id, { onDelete: 'cascade' }),
    /** Set for script-related change types; used for 24h alert dedupe. */
    scriptId: text('script_id').references(() => scripts.id, { onDelete: 'set null' }),
    type: changeTypeEnum('type').notNull(),
    severity: changeSeverityEnum('severity').notNull(),
    detail: jsonb('detail').$type<Record<string, unknown>>().notNull(),
    detectedAt: ts('detected_at').notNull().defaultNow(),
    acknowledgedAt: ts('acknowledged_at'),
    acknowledgedBy: text('acknowledged_by').references(() => users.id, { onDelete: 'set null' }),
  },
  (t) => [
    index('changes_page_detected_idx').on(t.pageId, t.detectedAt),
    index('changes_script_idx').on(t.scriptId),
  ],
);

export const alerts = pgTable(
  'alerts',
  {
    id: id(),
    changeId: text('change_id')
      .notNull()
      .references(() => changes.id, { onDelete: 'cascade' }),
    channel: alertChannelEnum('channel').notNull(),
    sentAt: ts('sent_at').notNull().defaultNow(),
    status: alertStatusEnum('status').notNull(),
  },
  (t) => [index('alerts_change_idx').on(t.changeId), index('alerts_sent_idx').on(t.sentAt)],
);

export const cspReports = pgTable(
  'csp_reports',
  {
    id: id(),
    siteId: text('site_id')
      .notNull()
      .references(() => sites.id, { onDelete: 'cascade' }),
    blockedUri: text('blocked_uri').notNull(),
    violatedDirective: text('violated_directive').notNull(),
    documentUri: text('document_uri').notNull(),
    count: integer('count').notNull().default(1),
    firstSeen: ts('first_seen').notNull().defaultNow(),
    lastSeen: ts('last_seen').notNull().defaultNow(),
  },
  (t) => [
    index('csp_reports_site_idx').on(t.siteId),
    uniqueIndex('csp_reports_dedupe_uq').on(
      t.siteId,
      t.blockedUri,
      t.violatedDirective,
      t.documentUri,
    ),
  ],
);

export const evidenceReports = pgTable(
  'evidence_reports',
  {
    id: id(),
    orgId: text('org_id')
      .notNull()
      .references(() => orgs.id, { onDelete: 'cascade' }),
    siteId: text('site_id')
      .notNull()
      .references(() => sites.id, { onDelete: 'cascade' }),
    periodStart: ts('period_start').notNull(),
    periodEnd: ts('period_end').notNull(),
    pdfPath: text('pdf_path').notNull(),
    generatedAt: ts('generated_at').notNull().defaultNow(),
  },
  (t) => [index('evidence_reports_site_idx').on(t.siteId)],
);

/** Free one-off scanner results (lead magnet). Stores nothing beyond this row. */
export const freeScans = pgTable(
  'free_scans',
  {
    id: id(),
    url: text('url').notNull(),
    email: text('email'),
    status: freeScanStatusEnum('status').notNull().default('queued'),
    resultJson: jsonb('result_json').$type<Record<string, unknown>>(),
    ip: text('ip').notNull(),
    createdAt: createdAt(),
  },
  (t) => [index('free_scans_ip_created_idx').on(t.ip, t.createdAt)],
);

export const subscriptions = pgTable(
  'subscriptions',
  {
    orgId: text('org_id')
      .primaryKey()
      .references(() => orgs.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(),
    providerSubId: text('provider_sub_id').notNull(),
    plan: planEnum('plan').notNull(),
    status: text('status').notNull(),
    renewsAt: ts('renews_at'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex('subscriptions_provider_sub_uq').on(t.provider, t.providerSubId)],
);
