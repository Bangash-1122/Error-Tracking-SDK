import { pgTable, text, integer, timestamp, uuid, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { projects } from './projects.js';
import { users } from './users.js';

export const issues = pgTable('issues', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  fingerprint: text('fingerprint').notNull(),
  title: text('title').notNull(),
  culprit: text('culprit').notNull().default('unknown'),
  type: text('type').notNull().default('Error'),
  status: text('status').notNull().default('unresolved'), // unresolved, resolved, ignored
  count: integer('count').notNull().default(1),
  firstSeen: timestamp('first_seen', { withTimezone: true }).defaultNow().notNull(),
  lastSeen: timestamp('last_seen', { withTimezone: true }).defaultNow().notNull(),
  assignedTo: uuid('assigned_to').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('issue_project_fingerprint_idx').on(table.projectId, table.fingerprint),
  index('issue_project_last_seen_idx').on(table.projectId, table.lastSeen),
]);

export type Issue = typeof issues.$inferSelect;
export type NewIssue = typeof issues.$inferInsert;
