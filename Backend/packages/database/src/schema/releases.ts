import { pgTable, text, timestamp, uuid, jsonb, uniqueIndex } from 'drizzle-orm/pg-core';
import { projects } from './projects.js';
import { issues } from './issues.js';

export const releases = pgTable('releases', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  version: text('version').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('release_project_version_idx').on(table.projectId, table.version),
]);

export const issueReleases = pgTable('issue_releases', {
  id: uuid('id').primaryKey().defaultRandom(),
  issueId: uuid('issue_id').references(() => issues.id, { onDelete: 'cascade' }).notNull(),
  releaseId: uuid('release_id').references(() => releases.id, { onDelete: 'cascade' }).notNull(),
  firstSeenAt: timestamp('first_seen_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('issue_release_unique_idx').on(table.issueId, table.releaseId),
]);

export type Release = typeof releases.$inferSelect;
export type IssueRelease = typeof issueReleases.$inferSelect;
