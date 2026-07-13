import { relations } from 'drizzle-orm';
import {
  alerts,
  changes,
  headerSnapshots,
  orgMembers,
  orgs,
  pages,
  scans,
  scriptObservations,
  scripts,
  sites,
  users,
} from './schema';

export const orgsRelations = relations(orgs, ({ many }) => ({
  members: many(orgMembers),
  sites: many(sites),
}));

export const orgMembersRelations = relations(orgMembers, ({ one }) => ({
  org: one(orgs, { fields: [orgMembers.organizationId], references: [orgs.id] }),
  user: one(users, { fields: [orgMembers.userId], references: [users.id] }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(orgMembers),
}));

export const sitesRelations = relations(sites, ({ one, many }) => ({
  org: one(orgs, { fields: [sites.orgId], references: [orgs.id] }),
  pages: many(pages),
  scripts: many(scripts),
}));

export const pagesRelations = relations(pages, ({ one, many }) => ({
  site: one(sites, { fields: [pages.siteId], references: [sites.id] }),
  scans: many(scans),
  changes: many(changes),
}));

export const scansRelations = relations(scans, ({ one, many }) => ({
  page: one(pages, { fields: [scans.pageId], references: [pages.id] }),
  observations: many(scriptObservations),
  headerSnapshots: many(headerSnapshots),
}));

export const scriptsRelations = relations(scripts, ({ one, many }) => ({
  site: one(sites, { fields: [scripts.siteId], references: [sites.id] }),
  observations: many(scriptObservations),
  changes: many(changes),
}));

export const scriptObservationsRelations = relations(scriptObservations, ({ one }) => ({
  scan: one(scans, { fields: [scriptObservations.scanId], references: [scans.id] }),
  script: one(scripts, { fields: [scriptObservations.scriptId], references: [scripts.id] }),
}));

export const headerSnapshotsRelations = relations(headerSnapshots, ({ one }) => ({
  scan: one(scans, { fields: [headerSnapshots.scanId], references: [scans.id] }),
}));

export const changesRelations = relations(changes, ({ one, many }) => ({
  page: one(pages, { fields: [changes.pageId], references: [pages.id] }),
  script: one(scripts, { fields: [changes.scriptId], references: [scripts.id] }),
  alerts: many(alerts),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  change: one(changes, { fields: [alerts.changeId], references: [changes.id] }),
}));
